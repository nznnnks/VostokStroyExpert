import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AuthService } from './auth.service';
import { AdminAccess } from './decorators/admin-access.decorator';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
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
