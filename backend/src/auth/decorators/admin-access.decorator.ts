import { UserRole } from '@prisma/client';
import { applyDecorators, UseGuards } from '@nestjs/common';

import { AdminRoles } from './admin-roles.decorator';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { AdminRolesGuard } from '../guards/admin-roles.guard';

export const AdminAccess = (...roles: UserRole[]) =>
  applyDecorators(AdminRoles(...roles), UseGuards(AdminAuthGuard, AdminRolesGuard));
