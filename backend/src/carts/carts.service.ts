import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartStatus, DiscountScope, DiscountType, ItemKind, Prisma, ProductStatus } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

const cartInclude = {
  user: {
    include: {
      clientProfile: true,
    },
  },
  appliedDiscount: true,
  items: {
    include: {
      product: {
        include: {
          category: true,
        },
      },
      service: true,
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.CartInclude;

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto, userId?: string) {
    const carts = await this.prisma.cart.findMany({
      where: userId
        ? { userId, status: CartStatus.ACTIVE }
        : query.search
          ? {
              user: {
                OR: [
                  { email: { contains: query.search, mode: 'insensitive' } },
                  { phone: { contains: query.search, mode: 'insensitive' } },
                ],
              },
            }
          : undefined,
      include: cartInclude,
      orderBy: { updatedAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return carts.map((cart) => this.toCartResponse(cart));
  }

  async findCurrent(userId: string) {
    const cart = await this.getOrCreateCurrentCart(userId);
    return this.toCartResponse(cart);
  }

  async findOne(id: string, userId?: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: cartInclude,
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${id} not found.`);
    }

    if (userId && cart.userId !== userId) {
      throw new ForbiddenException(`Cart ${id} does not belong to the current user.`);
    }

    return this.toCartResponse(cart);
  }

  async create(dto: CreateCartDto, userId?: string) {
    const ownerUserId = userId ?? dto.userId;
    const cart = await this.getOrCreateCurrentCart(ownerUserId);

    const updatedCart = await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        appliedDiscountId: await this.resolveAppliedDiscountId(dto.appliedDiscountId, ownerUserId),
        status: dto.status ?? CartStatus.ACTIVE,
        comment: dto.comment === undefined ? cart.comment : dto.comment,
      },
      include: cartInclude,
    });

    return this.toCartResponse(updatedCart);
  }

  async updateCurrent(dto: UpdateCartDto, userId: string) {
    const cart = await this.getOrCreateCurrentCart(userId);

    const updatedCart = await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        appliedDiscountId:
          dto.appliedDiscountId === undefined
            ? undefined
            : await this.resolveAppliedDiscountId(dto.appliedDiscountId, userId),
        status: dto.status ?? undefined,
        comment: dto.comment === undefined ? undefined : dto.comment,
      },
      include: cartInclude,
    });

    return this.toCartResponse(updatedCart);
  }

  async addItemToCurrent(dto: AddCartItemDto, userId: string) {
    const cart = await this.getOrCreateCurrentCart(userId);
    return this.addItem(cart.id, dto, userId);
  }

  async update(id: string, dto: UpdateCartDto, userId?: string) {
    await this.ensureCartAccess(id, userId);
    const cart = await this.prisma.cart.update({
      where: { id },
      data: {
        ...dto,
        appliedDiscountId:
          dto.appliedDiscountId === undefined
            ? undefined
            : await this.resolveAppliedDiscountId(dto.appliedDiscountId, userId),
      },
      include: cartInclude,
    });
    return this.toCartResponse(cart);
  }

  async addItem(cartId: string, dto: AddCartItemDto, userId?: string) {
    const cart = await this.ensureCartAccess(cartId, userId);
    this.assertSingleItemTarget(dto);

    const quantity = dto.quantity ?? 1;

    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product || product.status !== ProductStatus.ACTIVE) {
        throw new NotFoundException(`Product ${dto.productId} not found.`);
      }

      const existing = await this.prisma.cartItem.findFirst({
        where: { cartId, productId: dto.productId },
      });

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + quantity,
            totalPrice: product.price.mul(existing.quantity + quantity),
          },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId,
            productId: dto.productId,
            kind: ItemKind.PRODUCT,
            quantity,
            unitPrice: product.price,
            totalPrice: product.price.mul(quantity),
          },
        });
      }
    }

    if (dto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });

      if (!service || !service.isActive) {
        throw new NotFoundException(`Service ${dto.serviceId} not found.`);
      }

      const existing = await this.prisma.cartItem.findFirst({
        where: { cartId, serviceId: dto.serviceId },
      });

      const unitPrice = service.basePrice ?? new Prisma.Decimal(0);

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + quantity,
            totalPrice: unitPrice.mul(existing.quantity + quantity),
          },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId,
            serviceId: dto.serviceId,
            kind: ItemKind.SERVICE,
            quantity,
            unitPrice,
            totalPrice: unitPrice.mul(quantity),
          },
        });
      }
    }

    if (cart.status !== CartStatus.ACTIVE) {
      await this.prisma.cart.update({
        where: { id: cartId },
        data: { status: CartStatus.ACTIVE },
      });
    }

    return this.findOne(cartId, userId);
  }

  async updateCurrentItem(itemId: string, dto: UpdateCartItemDto, userId: string) {
    const cart = await this.getOrCreateCurrentCart(userId);
    return this.updateItem(cart.id, itemId, dto, userId);
  }

  async updateItem(cartId: string, itemId: string, dto: UpdateCartItemDto, userId?: string) {
    await this.ensureCartAccess(cartId, userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      include: {
        product: true,
        service: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Cart item ${itemId} not found in cart ${cartId}.`);
    }

    const unitPrice = item.product?.price ?? item.service?.basePrice ?? new Prisma.Decimal(0);

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: dto.quantity,
        unitPrice,
        totalPrice: unitPrice.mul(dto.quantity),
      },
    });

    return this.findOne(cartId, userId);
  }

  async removeCurrentItem(itemId: string, userId: string) {
    const cart = await this.getOrCreateCurrentCart(userId);
    return this.removeItem(cart.id, itemId, userId);
  }

  async removeItem(cartId: string, itemId: string, userId?: string) {
    await this.ensureCartAccess(cartId, userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException(`Cart item ${itemId} not found in cart ${cartId}.`);
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.findOne(cartId, userId);
  }

  async clearCurrent(userId: string) {
    const cart = await this.getOrCreateCurrentCart(userId);
    return this.clear(cart.id, userId);
  }

  async clear(id: string, userId?: string) {
    const cart = await this.ensureCartAccess(id, userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.findOne(id, userId);
  }

  async remove(id: string, userId?: string) {
    await this.ensureCartAccess(id, userId);
    await this.prisma.cart.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async getOrCreateCurrentCart(userId: string) {
    const existingCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });

    if (!existingCart) {
      return this.prisma.cart.create({
        data: {
          userId,
          status: CartStatus.ACTIVE,
        },
        include: cartInclude,
      });
    }

    if (existingCart.status === CartStatus.ACTIVE) {
      return existingCart;
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: existingCart.id },
    });

    return this.prisma.cart.update({
      where: { id: existingCart.id },
      data: {
        status: CartStatus.ACTIVE,
        appliedDiscountId: null,
        comment: null,
      },
      include: cartInclude,
    });
  }

  private async ensureCartAccess(id: string, userId?: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${id} not found.`);
    }

    if (userId && cart.userId !== userId) {
      throw new ForbiddenException(`Cart ${id} does not belong to the current user.`);
    }

    return cart;
  }

  private assertSingleItemTarget(dto: AddCartItemDto) {
    if ((dto.productId && dto.serviceId) || (!dto.productId && !dto.serviceId)) {
      throw new BadRequestException('Provide exactly one of productId or serviceId.');
    }
  }

  private async resolveAppliedDiscountId(
    appliedDiscountId: string | null | undefined,
    userId?: string,
  ) {
    if (appliedDiscountId === undefined) {
      return undefined;
    }

    if (appliedDiscountId === null) {
      return null;
    }

    const discount = await this.prisma.discount.findUnique({
      where: { id: appliedDiscountId },
      include: {
        clientProfile: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!discount) {
      throw new NotFoundException(`Discount ${appliedDiscountId} not found.`);
    }

    if (!discount.isActive || !this.isDiscountInActiveWindow(discount)) {
      throw new BadRequestException(`Discount ${appliedDiscountId} is not active.`);
    }

    if (
      discount.scope !== DiscountScope.ORDER &&
      discount.scope !== DiscountScope.CLIENT
    ) {
      throw new BadRequestException(
        `Discount ${appliedDiscountId} cannot be applied to cart total.`,
      );
    }

    if (
      discount.scope === DiscountScope.CLIENT &&
      (!userId || discount.clientProfile?.userId !== userId)
    ) {
      throw new ForbiddenException(
        `Discount ${appliedDiscountId} does not belong to the current user.`,
      );
    }

    return discount.id;
  }

  private isDiscountInActiveWindow(
    discount: Pick<Prisma.DiscountGetPayload<{ include: { clientProfile: true } }>, 'startsAt' | 'endsAt'>,
  ) {
    const now = new Date();

    if (discount.startsAt && discount.startsAt > now) {
      return false;
    }

    if (discount.endsAt && discount.endsAt < now) {
      return false;
    }

    return true;
  }

  private toCartResponse(cart: Prisma.CartGetPayload<{ include: typeof cartInclude }>) {
    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice.toNumber(), 0);
    const itemsQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const discountTotal = this.getDiscountValue(
      subtotal,
      cart.appliedDiscount,
      cart.user.clientProfile?.id ?? null,
    );
    const total = Math.max(subtotal - discountTotal, 0);

    return {
      ...cart,
      user: cart.user
        ? {
            ...cart.user,
            passwordHash: undefined,
          }
        : null,
      items: cart.items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toNumber(),
        totalPrice: item.totalPrice.toNumber(),
      })),
      summary: {
        itemsCount: cart.items.length,
        itemsQuantity,
        subtotal: Number(subtotal.toFixed(2)),
        discountTotal: Number(discountTotal.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
    };
  }

  private getDiscountValue(
    subtotal: number,
    discount: Prisma.DiscountGetPayload<{}> | null,
    clientProfileId: string | null,
  ) {
    if (!discount) {
      return 0;
    }

    if (!discount.isActive || !this.isDiscountInActiveWindow(discount)) {
      return 0;
    }

    if (
      discount.scope === DiscountScope.CLIENT &&
      discount.clientProfileId &&
      discount.clientProfileId !== clientProfileId
    ) {
      return 0;
    }

    if (
      discount.scope !== DiscountScope.ORDER &&
      discount.scope !== DiscountScope.CLIENT
    ) {
      return 0;
    }

    if (discount.type === DiscountType.PERCENT) {
      return Number((subtotal * (discount.value.toNumber() / 100)).toFixed(2));
    }

    return Number(Math.min(discount.value.toNumber(), subtotal).toFixed(2));
  }
}
