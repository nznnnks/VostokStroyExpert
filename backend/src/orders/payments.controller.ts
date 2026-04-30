import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { BlockList, isIP } from 'node:net';

import { AdminAccess } from '../auth/decorators/admin-access.decorator';
import { CurrentAuth } from '../auth/decorators/current-auth.decorator';
import { OptionalAuthenticatedGuard } from '../auth/guards/optional-authenticated.guard';
import { OptionalAuthPrincipal } from '../auth/interfaces/auth-principal.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateYooKassaPaymentDto } from './dto/create-yookassa-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';
import { YooKassaWebhookDto } from './dto/yookassa-webhook.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  findAll(@Query() query: PaginationQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Get(':id')
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Post('yookassa/create')
  @UseGuards(OptionalAuthenticatedGuard)
  createYooKassaPayment(@Body() dto: CreateYooKassaPaymentDto, @CurrentAuth() auth: OptionalAuthPrincipal) {
    return this.paymentsService.createYooKassaPayment(dto, auth);
  }

  @Get('yookassa/:paymentId/status')
  getYooKassaPaymentStatus(@Param('paymentId') paymentId: string) {
    return this.paymentsService.getYooKassaPaymentStatus(paymentId);
  }

  @Post('yookassa/webhook')
  handleYooKassaWebhook(@Req() request: Request, @Body() dto: YooKassaWebhookDto) {
    if (process.env.YOOKASSA_WEBHOOK_VALIDATE_IP === 'true') {
      const forwardedFor = request.headers['x-forwarded-for'];
      const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0];
      const remoteIp = (forwardedIp ?? request.ip ?? request.socket.remoteAddress ?? '').trim();

      if (!isAllowedYooKassaIp(remoteIp)) {
        throw new ForbiddenException(`Rejected YooKassa webhook from IP ${remoteIp || 'unknown'}.`);
      }
    }

    return this.paymentsService.handleYooKassaWebhook(dto);
  }

  @Patch(':id')
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}

const yookassaWebhookIpBlockList = new BlockList();
yookassaWebhookIpBlockList.addSubnet('185.71.76.0', 27, 'ipv4');
yookassaWebhookIpBlockList.addSubnet('185.71.77.0', 27, 'ipv4');
yookassaWebhookIpBlockList.addSubnet('77.75.153.0', 25, 'ipv4');
yookassaWebhookIpBlockList.addAddress('77.75.156.11', 'ipv4');
yookassaWebhookIpBlockList.addAddress('77.75.156.35', 'ipv4');
yookassaWebhookIpBlockList.addSubnet('77.75.154.128', 25, 'ipv4');
yookassaWebhookIpBlockList.addSubnet('2a02:5180::', 32, 'ipv6');

function isAllowedYooKassaIp(ip: string) {
  if (!ip) {
    return false;
  }

  const normalizedIp = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  if (!isIP(normalizedIp)) {
    return false;
  }

  return yookassaWebhookIpBlockList.check(normalizedIp);
}
