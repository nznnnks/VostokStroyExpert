import { ForbiddenException, Injectable } from '@nestjs/common';

import { AuthPrincipal } from '../interfaces/auth-principal.interface';
import { AuthenticatedGuard } from './authenticated.guard';

@Injectable()
export class AdminAuthGuard extends AuthenticatedGuard {
  protected validatePrincipal(principal: AuthPrincipal) {
    if (principal.type !== 'admin') {
      throw new ForbiddenException('Admin access is required.');
    }
  }
}
