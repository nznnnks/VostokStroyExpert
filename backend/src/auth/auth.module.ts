import { Global, Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminRolesGuard } from './guards/admin-roles.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { UserAuthGuard } from './guards/user-auth.guard';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    AuthenticatedGuard,
    UserAuthGuard,
    AdminAuthGuard,
    AdminRolesGuard,
  ],
  exports: [
    AuthService,
    PasswordService,
    AuthenticatedGuard,
    UserAuthGuard,
    AdminAuthGuard,
    AdminRolesGuard,
  ],
})
export class AuthModule {}
