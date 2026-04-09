import { Injectable } from '@nestjs/common';

import { AuthenticatedUser } from '../auth/interfaces/auth-principal.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateOrderTemplateDto } from '../orders/dto/create-order-template.dto';
import { UpdateOrderTemplateDto } from '../orders/dto/update-order-template.dto';
import { OrderTemplatesService } from '../orders/order-templates.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { UpdateAccountProfileDto } from './dto/update-account-profile.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly orderTemplatesService: OrderTemplatesService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.usersService.findCurrent(userId);
    return this.toAccountProfile(user);
  }

  async updateProfile(userId: string, dto: UpdateAccountProfileDto) {
    const user = await this.usersService.updateCurrent(userId, {
      email: dto.email,
      phone: dto.phone,
      passwordHash: dto.password,
      clientProfile: dto.clientProfile,
    });

    return this.toAccountProfile(user);
  }

  async getDiscount(userId: string) {
    const user = await this.usersService.findCurrent(userId);

    return {
      userId: user.id,
      clientProfileId: user.clientProfile?.id ?? null,
      personalDiscountPercent: user.clientProfile?.personalDiscountPercent ?? null,
    };
  }

  getOrders(user: AuthenticatedUser, query: PaginationQueryDto) {
    return this.ordersService.findAll(query, user);
  }

  getOrder(user: AuthenticatedUser, orderId: string) {
    return this.ordersService.findOne(orderId, user);
  }

  getOrderTemplates(userId: string, query: PaginationQueryDto) {
    return this.orderTemplatesService.findAll(query, userId);
  }

  getOrderTemplate(userId: string, templateId: string) {
    return this.orderTemplatesService.findOne(templateId, userId);
  }

  createOrderTemplate(userId: string, dto: CreateOrderTemplateDto) {
    return this.orderTemplatesService.create(dto, userId);
  }

  updateOrderTemplate(userId: string, templateId: string, dto: UpdateOrderTemplateDto) {
    return this.orderTemplatesService.update(templateId, dto, userId);
  }

  removeOrderTemplate(userId: string, templateId: string) {
    return this.orderTemplatesService.remove(templateId, userId);
  }

  private toAccountProfile(
    user: Awaited<ReturnType<UsersService['findCurrent']>>,
  ) {
    return {
      ...user,
      personalDiscountPercent: user.clientProfile?.personalDiscountPercent ?? null,
    };
  }
}
