import { ForbiddenException, Injectable } from '@nestjs/common';

import { AuthPrincipal } from '../interfaces/auth-principal.interface';
import { AuthenticatedGuard } from './authenticated.guard';

@Injectable()
export class UserAuthGuard extends AuthenticatedGuard {
  protected validatePrincipal(principal: AuthPrincipal) {
    if (principal.type !== 'user') {
      throw new ForbiddenException('User access is required.');
    }
  }
}
