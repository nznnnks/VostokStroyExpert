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
import { AdminRole } from '@prisma/client';

import { AdminAccess } from '../auth/decorators/admin-access.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  findAll(@Query() query: PaginationQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Get(':id')
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Patch(':id')
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
