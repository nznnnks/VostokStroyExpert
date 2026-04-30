import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';

import { OptionalAuthPrincipal } from '../auth/interfaces/auth-principal.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateYooKassaPaymentDto } from './dto/create-yookassa-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { YooKassaWebhookDto } from './dto/yookassa-webhook.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  findAll(query: PaginationQueryDto) {
    return this.prisma.payment.findMany({
      where: query.search
        ? {
            OR: [
              { transactionId: { contains: query.search, mode: 'insensitive' } },
              { provider: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found.`);
    }

    return payment;
  }

  create(dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        ...dto,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
      include: {
        order: true,
      },
    });
  }

  async update(id: string, dto: UpdatePaymentDto) {
    await this.ensureExists(id);
    return this.prisma.payment.update({
      where: { id },
      data: {
        ...dto,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
      include: {
        order: true,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.payment.delete({ where: { id } });
    return { deleted: true, id };
  }

  async createYooKassaPayment(dto: CreateYooKassaPaymentDto, auth?: OptionalAuthPrincipal) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        user: {
          include: {
            clientProfile: true,
          },
        },
        items: {
          orderBy: { createdAt: 'asc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${dto.orderId} not found.`);
    }

    if (auth?.type === 'user' && order.userId !== auth.userId) {
      throw new BadRequestException('Order does not belong to the current user.');
    }

    const existingSuccessful = order.payments.find((payment) => payment.status === PaymentStatus.PAID);
    if (existingSuccessful) {
      throw new BadRequestException('This order is already paid.');
    }

    const creds = this.getYooKassaCredentials();
    const amountValue = order.total.toFixed(2);
    const returnUrl =
      dto.returnUrl?.trim() ||
      process.env.YOOKASSA_RETURN_URL?.trim() ||
      'http://localhost:4321/checkout?payment=return';
    const idempotenceKey = globalThis.crypto?.randomUUID?.() ?? `${order.id}-${Date.now()}`;

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${creds.shopId}:${creds.secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
      },
      body: JSON.stringify({
        amount: {
          value: amountValue,
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: returnUrl,
        },
        description: `Заказ ${order.orderNumber}`,
        metadata: {
          order_id: order.id,
          order_number: order.orderNumber,
        },
      }),
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || !payload) {
      throw new BadRequestException(
        `YooKassa create payment failed${payload && typeof payload.description === 'string' ? `: ${payload.description}` : '.'}`,
      );
    }

    const paymentId = typeof payload.id === 'string' ? payload.id : null;
    const status = typeof payload.status === 'string' ? payload.status : 'pending';
    const confirmation = payload.confirmation as { confirmation_url?: string } | undefined;
    const paid = payload.paid === true;

    if (!paymentId || !confirmation?.confirmation_url) {
      throw new BadRequestException('YooKassa response does not contain payment id or confirmation url.');
    }

    const localPayment = await this.prisma.payment.upsert({
      where: { transactionId: paymentId },
      update: {
        provider: 'yookassa',
        method: PaymentMethod.CARD,
        status: this.mapYooKassaStatus(status, paid),
        amount: new Prisma.Decimal(amountValue),
        currency: 'RUB',
        paidAt: paid ? new Date() : null,
      },
      create: {
        orderId: order.id,
        provider: 'yookassa',
        transactionId: paymentId,
        method: PaymentMethod.CARD,
        status: this.mapYooKassaStatus(status, paid),
        amount: new Prisma.Decimal(amountValue),
        currency: 'RUB',
        paidAt: paid ? new Date() : undefined,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentId,
      status,
      confirmationUrl: confirmation.confirmation_url,
      payment: {
        ...localPayment,
        amount: localPayment.amount.toNumber(),
      },
      test: payload.test === true,
    };
  }

  async getYooKassaPaymentStatus(paymentId: string) {
    const payload = await this.fetchYooKassaPayment(paymentId);

    const status = typeof payload.status === 'string' ? payload.status : 'pending';
    const paid = payload.paid === true;
    await this.syncYooKassaPaymentFromApiPayload(payload);

    return {
      paymentId,
      status,
      paid,
      test: payload.test === true,
    };
  }

  async handleYooKassaWebhook(payload: YooKassaWebhookDto) {
    if (!payload?.object?.id) {
      throw new BadRequestException('Webhook payload does not contain payment id.');
    }

    const supportedEvents = new Set([
      'payment.waiting_for_capture',
      'payment.succeeded',
      'payment.canceled',
    ]);

    if (!supportedEvents.has(payload.event)) {
      this.logger.warn(`Ignoring unsupported YooKassa webhook event: ${payload.event}`);
      return { received: true, ignored: true };
    }

    try {
      const remotePayment = await this.fetchYooKassaPayment(payload.object.id);
      await this.syncYooKassaPaymentFromApiPayload(remotePayment);
    } catch (error) {
      this.logger.error(
        `Failed to process YooKassa webhook for payment ${payload.object.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }

    return { received: true };
  }

  private async syncYooKassaPaymentFromApiPayload(payload: Record<string, unknown>) {
    const paymentId = typeof payload.id === 'string' ? payload.id : null;
    if (!paymentId) {
      throw new BadRequestException('YooKassa payload does not contain payment id.');
    }

    const existing = await this.prisma.payment.findUnique({
      where: { transactionId: paymentId },
      include: { order: true },
    });

    if (!existing) {
      this.logger.warn(`YooKassa payment ${paymentId} is not linked to a local payment record.`);
      return null;
    }

    const status = typeof payload.status === 'string' ? payload.status : 'pending';
    const paid = payload.paid === true;
    const amount = payload.amount as { value?: string; currency?: string } | undefined;
    const nextStatus = this.mapYooKassaStatus(status, paid);
    const paidAtRaw =
      typeof payload.captured_at === 'string'
        ? payload.captured_at
        : typeof payload.paid_at === 'string'
          ? payload.paid_at
          : null;

    if (typeof amount?.value === 'string' && amount.value) {
      const remoteAmount = Number(amount.value);
      const localAmount = existing.amount.toNumber();
      if (Number.isFinite(remoteAmount) && remoteAmount !== localAmount) {
        this.logger.error(
          `Amount mismatch for YooKassa payment ${paymentId}: remote=${remoteAmount}, local=${localAmount}`,
        );
        throw new BadRequestException('YooKassa payment amount does not match local payment amount.');
      }
    }

    const payment = await this.prisma.payment.update({
      where: { id: existing.id },
      data: {
        provider: 'yookassa',
        status: nextStatus,
        amount:
          typeof amount?.value === 'string' && amount.value
            ? new Prisma.Decimal(amount.value)
            : existing.amount,
        currency: typeof amount?.currency === 'string' && amount.currency ? amount.currency : existing.currency,
        paidAt: nextStatus === PaymentStatus.PAID ? (paidAtRaw ? new Date(paidAtRaw) : existing.paidAt ?? new Date()) : null,
      },
    });

    if (nextStatus === PaymentStatus.PAID && existing.order.status === OrderStatus.NEW) {
      await this.prisma.order.update({
        where: { id: existing.orderId },
        data: { status: OrderStatus.PAID },
      });
    }

    return payment;
  }

  private mapYooKassaStatus(status: string, paid: boolean) {
    if (status === 'succeeded' || paid) {
      return PaymentStatus.PAID;
    }

    if (status === 'canceled') {
      return PaymentStatus.FAILED;
    }

    return PaymentStatus.PENDING;
  }

  private getYooKassaCredentials() {
    const shopId = process.env.YOOKASSA_SHOP_ID?.trim();
    const secretKey = process.env.YOOKASSA_SECRET_KEY?.trim();

    if (!shopId || !secretKey) {
      throw new BadRequestException('YooKassa is not configured. Set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY.');
    }

    return { shopId, secretKey };
  }

  private async fetchYooKassaPayment(paymentId: string) {
    const creds = this.getYooKassaCredentials();
    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${creds.shopId}:${creds.secretKey}`).toString('base64')}`,
      },
    });

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || !payload) {
      this.logger.error(`Failed to fetch YooKassa payment ${paymentId}. HTTP ${response.status}`);
      throw new BadRequestException('Failed to fetch payment status from YooKassa.');
    }

    return payload;
  }

  private async ensureExists(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found.`);
    }
  }
}
