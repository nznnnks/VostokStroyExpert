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
import { UserRole } from '@prisma/client';

import { AdminAccess } from '../auth/decorators/admin-access.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';
import { ServiceOfferingsService } from './service-offerings.service';

@Controller('services')
export class ServiceOfferingsController {
  constructor(private readonly serviceOfferingsService: ServiceOfferingsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.serviceOfferingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOfferingsService.findOne(id);
  }

  @Post()
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateServiceOfferingDto) {
    return this.serviceOfferingsService.create(dto);
  }

  @Patch(':id')
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateServiceOfferingDto) {
    return this.serviceOfferingsService.update(id, dto);
  }

  @Delete(':id')
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.serviceOfferingsService.remove(id);
  }
}
