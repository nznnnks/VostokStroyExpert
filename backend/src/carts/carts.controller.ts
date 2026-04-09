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
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartsService } from './carts.service';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get('current')
  @UserAccess()
  findCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.cartsService.findCurrent(user.userId);
  }

  @Patch('current')
  @UserAccess()
  updateCurrent(@Body() dto: UpdateCartDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cartsService.updateCurrent(dto, user.userId);
  }

  @Post('current/items')
  @UserAccess()
  addItemToCurrent(@Body() dto: AddCartItemDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cartsService.addItemToCurrent(dto, user.userId);
  }

  @Patch('current/items/:itemId')
  @UserAccess()
  updateCurrentItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartsService.updateCurrentItem(itemId, dto, user.userId);
  }

  @Delete('current/items/:itemId')
  @UserAccess()
  removeCurrentItem(@Param('itemId') itemId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cartsService.removeCurrentItem(itemId, user.userId);
  }

  @Delete('current/items')
  @UserAccess()
  clearCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.cartsService.clearCurrent(user.userId);
  }

  @Get()
  @UserAccess()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cartsService.findAll(query, user.userId);
  }

  @Get(':id')
  @UserAccess()
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cartsService.findOne(id, user.userId);
  }

  @Post()
  @UserAccess()
  create(@Body() dto: CreateCartDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cartsService.create(dto, user.userId);
  }

  @Patch(':id')
  @UserAccess()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCartDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartsService.update(id, dto, user.userId);
  }

  @Post(':id/items')
  @UserAccess()
  addItem(
    @Param('id') id: string,
    @Body() dto: AddCartItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartsService.addItem(id, dto, user.userId);
  }

  @Patch(':id/items/:itemId')
  @UserAccess()
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartsService.updateItem(id, itemId, dto, user.userId);
  }

  @Delete(':id/items/:itemId')
  @UserAccess()
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cartsService.removeItem(id, itemId, user.userId);
  }

  @Delete(':id')
  @UserAccess()
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cartsService.remove(id, user.userId);
  }
}
