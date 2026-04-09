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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
