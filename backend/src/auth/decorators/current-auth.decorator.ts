import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthRequest } from '../interfaces/auth-request.interface';

export const CurrentAuth = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthRequest>();
  return request.auth;
});
