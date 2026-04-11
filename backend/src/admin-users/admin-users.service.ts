import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';

import { ADMIN_USER_ROLES, isAdminUserRole } from '../auth/constants/auth.constants';
import { PasswordService } from '../auth/password.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const admins = await this.prisma.user.findMany({
      where: query.search
        ? {
            AND: [
              { role: { in: [...ADMIN_USER_ROLES] } },
              {
                OR: [
                  { email: { contains: query.search, mode: 'insensitive' } },
                  { firstName: { contains: query.search, mode: 'insensitive' } },
                  { lastName: { contains: query.search, mode: 'insensitive' } },
                ],
              },
            ],
          }
        : { role: { in: [...ADMIN_USER_ROLES] } },
      include: {
        _count: {
          select: {
            news: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return admins.map((admin) => this.toResponse(admin));
  }

  async findOne(id: string) {
    const admin = await this.prisma.user.findFirst({
      where: {
        id,
        role: { in: [...ADMIN_USER_ROLES] },
      },
      include: {
        news: true,
      },
    });

    if (!admin) {
      throw new NotFoundException(`Admin user ${id} not found.`);
    }

    return this.toResponse(admin);
  }

  async create(dto: CreateAdminUserDto) {
    const role = dto.role ?? UserRole.MANAGER;

    if (!isAdminUserRole(role)) {
      throw new BadRequestException('Elevated role is required for admin users.');
    }

    const admin = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash: await this.passwordService.preparePasswordHash(dto.passwordHash),
        role,
        status: dto.isActive === false ? UserStatus.BLOCKED : UserStatus.ACTIVE,
      },
    });
    return this.toResponse(admin);
  }

  async update(id: string, dto: UpdateAdminUserDto) {
    await this.ensureExists(id);

    if (dto.role && !isAdminUserRole(dto.role)) {
      throw new BadRequestException('Elevated role is required for admin users.');
    }

    const admin = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash: dto.passwordHash
          ? await this.passwordService.preparePasswordHash(dto.passwordHash)
          : undefined,
        role: dto.role,
        status:
          dto.isActive === undefined
            ? undefined
            : dto.isActive
              ? UserStatus.ACTIVE
              : UserStatus.BLOCKED,
      },
    });
    return this.toResponse(admin);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureExists(id: string) {
    const admin = await this.prisma.user.findFirst({
      where: {
        id,
        role: { in: [...ADMIN_USER_ROLES] },
      },
      select: { id: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin user ${id} not found.`);
    }
  }

  private toResponse<
    T extends Prisma.UserGetPayload<{
      include?: { _count?: { select: { news: true } } };
    }>
  >(admin: T) {
    const { passwordHash: _passwordHash, status, ...safeAdmin } = admin;
    return {
      ...safeAdmin,
      isActive: status === UserStatus.ACTIVE,
    };
  }
}
