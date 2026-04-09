import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

import { AuthRequest } from '../interfaces/auth-request.interface';

export const CurrentAdmin = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthRequest>();

  if (request.auth?.type !== 'admin') {
    throw new ForbiddenException('Admin access is required.');
  }

  return request.auth;
});
