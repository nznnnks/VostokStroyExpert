import { AuthPrincipal } from './auth-principal.interface';

export interface AuthRequest {
  headers: {
    authorization?: string;
  };
  auth?: AuthPrincipal;
}
