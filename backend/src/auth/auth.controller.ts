import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AuthService } from './auth.service';
import { AdminAccess } from './decorators/admin-access.decorator';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthenticatedAdmin } from './interfaces/auth-principal.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user/login')
  loginUser(@Body() dto: LoginUserDto) {
    return this.authService.loginUser(dto);
  }

  @Post('user/register')
  registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('user/verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyUserEmail(dto);
  }

  @Post('user/resend-verification')
  resendVerification(@Body() dto: RequestEmailVerificationDto) {
    return this.authService.resendUserEmailVerification(dto.email);
  }

  @Post('user/verify-login-code')
  verifyLoginCode(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyUserLoginCode(dto);
  }

  @Post('user/resend-login-code')
  resendLoginCode(@Body() dto: RequestEmailVerificationDto) {
    return this.authService.resendUserLoginCode(dto.email);
  }

  @Post('user/request-password-reset')
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestUserPasswordReset(dto.email);
  }

  @Post('user/confirm-password-reset')
  confirmPasswordReset(@Body() dto: ConfirmPasswordResetDto) {
    return this.authService.confirmUserPasswordReset(dto);
  }

  @Post('admin/login')
  loginAdmin(@Body() dto: LoginAdminDto) {
    return this.authService.loginAdmin(dto);
  }

  @Get('admin/me')
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.EDITOR)
  getCurrentAdmin(@CurrentAdmin() admin: AuthenticatedAdmin) {
    return this.authService.getCurrentAdmin(admin.adminId);
  }
}
