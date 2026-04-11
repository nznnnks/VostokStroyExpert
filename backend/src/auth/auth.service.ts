import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';

import { PrismaService } from '../prisma/prisma.service';
import { isAdminUserRole } from './constants/auth.constants';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import {
  AuthPrincipal,
  AuthTokenPayload,
  AuthenticatedAdmin,
  AuthenticatedUser,
} from './interfaces/auth-principal.interface';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async loginUser(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { clientProfile: true },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid user credentials.');
    }

    const isValidPassword = await this.passwordService.verifyPassword(
      dto.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid user credentials.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const principal = this.toAuthPrincipal(user);

    return {
      accessToken: this.signAccessToken(principal),
      tokenType: 'Bearer',
      expiresIn: this.getJwtExpiresIn(),
      user: this.toSafeUser(user),
    };
  }

  async loginAdmin(dto: LoginAdminDto) {
    const admin = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { clientProfile: true },
    });

    if (!admin || admin.status !== UserStatus.ACTIVE || !isAdminUserRole(admin.role)) {
      throw new UnauthorizedException('Invalid admin credentials.');
    }

    const isValidPassword = await this.passwordService.verifyPassword(
      dto.password,
      admin.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid admin credentials.');
    }

    await this.prisma.user.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const principal: AuthenticatedAdmin = this.toAuthPrincipal(admin) as AuthenticatedAdmin;

    return {
      accessToken: this.signAccessToken(principal),
      tokenType: 'Bearer',
      expiresIn: this.getJwtExpiresIn(),
      admin: this.toSafeAdmin(admin),
    };
  }

  async registerUser(dto: RegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);
    const nameParts = dto.fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts.shift() ?? dto.fullName.trim();
    const lastName = nameParts.length > 0 ? nameParts.join(' ') : undefined;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone ?? null,
        passwordHash,
        firstName,
        lastName,
        status: UserStatus.ACTIVE,
        role: UserRole.CLIENT,
        clientProfile: {
          create: {
            firstName,
            lastName,
            contactPhone: dto.phone ?? null,
          },
        },
      },
      include: { clientProfile: true },
    });

    const principal: AuthenticatedUser = this.toAuthPrincipal(user) as AuthenticatedUser;

    return {
      accessToken: this.signAccessToken(principal),
      tokenType: 'Bearer',
      expiresIn: this.getJwtExpiresIn(),
      user: this.toSafeUser(user),
    };
  }

  verifyAccessToken(token: string): AuthPrincipal {
    try {
      const payload = jwt.verify(token, this.getJwtSecret()) as AuthTokenPayload;

      if (!payload?.sub || !payload?.type || !payload?.role || !payload?.email) {
        throw new UnauthorizedException('Invalid access token.');
      }

      if (payload.type === 'user') {
        return {
          type: 'user',
          userId: payload.sub,
          role: payload.role as UserRole,
          email: payload.email,
        };
      }

        return {
          type: 'admin',
          adminId: payload.sub,
          role: payload.role as UserRole,
          email: payload.email,
        };
    } catch {
      throw new UnauthorizedException('Invalid access token.');
    }
  }

  private signAccessToken(principal: AuthPrincipal) {
    const payload: AuthTokenPayload =
      principal.type === 'user'
        ? {
            sub: principal.userId,
            type: principal.type,
            role: principal.role,
            email: principal.email,
          }
        : {
            sub: principal.adminId,
            type: principal.type,
            role: principal.role,
            email: principal.email,
          };

    return jwt.sign(payload, this.getJwtSecret(), {
      expiresIn: this.getJwtExpiresIn(),
    } as SignOptions);
  }

  private getJwtSecret() {
    return process.env.JWT_SECRET ?? 'vostokstroyexpert-dev-secret';
  }

  private getJwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN ?? '12h';
  }

  private toAuthPrincipal(user: {
    id: string;
    email: string;
    role: UserRole;
  }): AuthPrincipal {
    if (isAdminUserRole(user.role)) {
      return {
        type: 'admin',
        adminId: user.id,
        role: user.role,
        email: user.email,
      };
    }

    return {
      type: 'user',
      userId: user.id,
      role: user.role,
      email: user.email,
    };
  }

  private toSafeUser<T extends { passwordHash: string }>(user: T) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private toSafeAdmin<T extends { passwordHash: string }>(admin: T) {
    const { passwordHash: _passwordHash, ...safeAdmin } = admin;
    return safeAdmin;
  }
}
