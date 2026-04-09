import { AdminRole, UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  type: 'user';
  userId: string;
  role: UserRole;
  email: string;
}

export interface AuthenticatedAdmin {
  type: 'admin';
  adminId: string;
  role: AdminRole;
  email: string;
}

export type AuthPrincipal = AuthenticatedUser | AuthenticatedAdmin;

export interface AuthTokenPayload {
  sub: string;
  type: AuthPrincipal['type'];
  role: UserRole | AdminRole;
  email: string;
}
