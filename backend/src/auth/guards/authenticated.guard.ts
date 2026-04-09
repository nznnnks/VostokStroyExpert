import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from '../auth.service';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { AuthPrincipal } from '../interfaces/auth-principal.interface';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = this.getTokenFromRequest(request);
    const principal = this.authService.verifyAccessToken(token);

    this.validatePrincipal(principal);
    request.auth = principal;

    return true;
  }

  protected validatePrincipal(_principal: AuthPrincipal) {}

  private getTokenFromRequest(request: AuthRequest) {
    const header = request.headers.authorization;

    if (!header) {
      throw new UnauthorizedException('Authorization header is required.');
    }

    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bearer token is required.');
    }

    return token;
  }
}
