import { UserRole } from '@prisma/client';
import { SetMetadata } from '@nestjs/common';

import { ADMIN_ROLES_KEY } from '../constants/auth.constants';

export const AdminRoles = (...roles: UserRole[]) =>
  SetMetadata(ADMIN_ROLES_KEY, roles);
