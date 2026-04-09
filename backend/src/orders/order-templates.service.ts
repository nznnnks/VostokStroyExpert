import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderTemplateDto } from './dto/create-order-template.dto';
import { UpdateOrderTemplateDto } from './dto/update-order-template.dto';

@Injectable()
export class OrderTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: PaginationQueryDto, userId?: string) {
    return this.prisma.orderTemplate.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search, mode: 'insensitive' } },
                { address: { contains: query.search, mode: 'insensitive' } },
                { contactName: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            clientProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  async findOne(id: string, userId?: string) {
    const template = await this.prisma.orderTemplate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            clientProfile: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Order template ${id} not found.`);
    }

    if (userId && template.userId !== userId) {
      throw new ForbiddenException(`Order template ${id} does not belong to the current user.`);
    }

    return template;
  }

  create(dto: CreateOrderTemplateDto, userId?: string) {
    return this.prisma.orderTemplate.create({
      data: {
        ...dto,
        userId: userId ?? dto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            clientProfile: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateOrderTemplateDto, userId?: string) {
    await this.ensureAccess(id, userId);
    return this.prisma.orderTemplate.update({
      where: { id },
      data: dto,
      include: {
        user: {
          include: {
            clientProfile: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId?: string) {
    await this.ensureAccess(id, userId);
    await this.prisma.orderTemplate.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureAccess(id: string, userId?: string) {
    const template = await this.prisma.orderTemplate.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!template) {
      throw new NotFoundException(`Order template ${id} not found.`);
    }

    if (userId && template.userId !== userId) {
      throw new ForbiddenException(`Order template ${id} does not belong to the current user.`);
    }
  }
}
