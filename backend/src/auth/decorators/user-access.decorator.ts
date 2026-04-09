import { applyDecorators, UseGuards } from '@nestjs/common';

import { UserAuthGuard } from '../guards/user-auth.guard';

export const UserAccess = () => applyDecorators(UseGuards(UserAuthGuard));
