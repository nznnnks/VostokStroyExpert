import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

import { AuthRequest } from '../interfaces/auth-request.interface';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthRequest>();

  if (request.auth?.type !== 'user') {
    throw new ForbiddenException('User access is required.');
  }

  return request.auth;
});
