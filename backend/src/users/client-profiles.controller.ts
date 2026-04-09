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
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UsersService } from './users.service';

@Controller('client-profiles')
export class ClientProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAllProfiles(query);
  }

  @Get(':id')
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.usersService.findProfile(id);
  }

  @Post()
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  create(@Body() dto: CreateClientProfileDto) {
    return this.usersService.createProfile(dto);
  }

  @Patch(':id')
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateClientProfileDto) {
    return this.usersService.updateProfile(id, dto);
  }

  @Delete(':id')
  @AdminAccess(AdminRole.SUPERADMIN, AdminRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.usersService.removeProfile(id);
  }
}
