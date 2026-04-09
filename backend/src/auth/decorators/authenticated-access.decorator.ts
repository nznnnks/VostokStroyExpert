import { applyDecorators, UseGuards } from '@nestjs/common';

import { AuthenticatedGuard } from '../guards/authenticated.guard';

export const AuthenticatedAccess = () => applyDecorators(UseGuards(AuthenticatedGuard));
