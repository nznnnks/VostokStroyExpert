import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserAccess } from '../auth/decorators/user-access.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth-principal.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateOrderTemplateDto } from '../orders/dto/create-order-template.dto';
import { UpdateOrderTemplateDto } from '../orders/dto/update-order-template.dto';
import { AccountService } from './account.service';
import { UpdateAccountProfileDto } from './dto/update-account-profile.dto';

@Controller('account')
@UserAccess()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.accountService.getProfile(user.userId);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAccountProfileDto,
  ) {
    return this.accountService.updateProfile(user.userId, dto);
  }

  @Get('discount')
  getDiscount(@CurrentUser() user: AuthenticatedUser) {
    return this.accountService.getDiscount(user.userId);
  }

  @Get('orders')
  getOrders(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.accountService.getOrders(user, query);
  }

  @Get('orders/:id')
  getOrder(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.accountService.getOrder(user, id);
  }

  @Get('order-templates')
  getOrderTemplates(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.accountService.getOrderTemplates(user.userId, query);
  }

  @Get('order-templates/:id')
  getOrderTemplate(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.accountService.getOrderTemplate(user.userId, id);
  }

  @Post('order-templates')
  createOrderTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrderTemplateDto,
  ) {
    return this.accountService.createOrderTemplate(user.userId, dto);
  }

  @Patch('order-templates/:id')
  updateOrderTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderTemplateDto,
  ) {
    return this.accountService.updateOrderTemplate(user.userId, id, dto);
  }

  @Delete('order-templates/:id')
  removeOrderTemplate(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.accountService.removeOrderTemplate(user.userId, id);
  }
}
