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
import { CreateOrderTemplateDto } from './dto/create-order-template.dto';
import { UpdateOrderTemplateDto } from './dto/update-order-template.dto';
import { OrderTemplatesService } from './order-templates.service';

@Controller('order-templates')
export class OrderTemplatesController {
  constructor(private readonly orderTemplatesService: OrderTemplatesService) {}

  @Get()
  @UserAccess()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.orderTemplatesService.findAll(query, user.userId);
  }

  @Get(':id')
  @UserAccess()
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.orderTemplatesService.findOne(id, user.userId);
  }

  @Post()
  @UserAccess()
  create(@Body() dto: CreateOrderTemplateDto, @CurrentUser() user: AuthenticatedUser) {
    return this.orderTemplatesService.create(dto, user.userId);
  }

  @Patch(':id')
  @UserAccess()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderTemplateDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderTemplatesService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @UserAccess()
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.orderTemplatesService.remove(id, user.userId);
  }
}
