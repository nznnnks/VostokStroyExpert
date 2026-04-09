import { AdminRole } from '@prisma/client';
import { SetMetadata } from '@nestjs/common';

import { ADMIN_ROLES_KEY } from '../constants/auth.constants';

export const AdminRoles = (...roles: AdminRole[]) => SetMetadata(ADMIN_ROLES_KEY, roles);
