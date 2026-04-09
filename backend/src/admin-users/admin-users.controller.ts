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
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@Controller('admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @AdminAccess(AdminRole.SUPERADMIN)
  findAll(@Query() query: PaginationQueryDto) {
    return this.adminUsersService.findAll(query);
  }

  @Get(':id')
  @AdminAccess(AdminRole.SUPERADMIN)
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Post()
  @AdminAccess(AdminRole.SUPERADMIN)
  create(@Body() dto: CreateAdminUserDto) {
    return this.adminUsersService.create(dto);
  }

  @Patch(':id')
  @AdminAccess(AdminRole.SUPERADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.adminUsersService.update(id, dto);
  }

  @Delete(':id')
  @AdminAccess(AdminRole.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.adminUsersService.remove(id);
  }
}
