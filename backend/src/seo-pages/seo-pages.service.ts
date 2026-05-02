import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateSeoPageDto } from './dto/update-seo-page.dto';

@Injectable()
export class SeoPagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.seoPage.findMany({
      orderBy: { key: 'asc' },
    });

    return { items };
  }

  async findOneOrNull(key: string) {
    return this.prisma.seoPage.findUnique({ where: { key } });
  }

  async findOne(key: string) {
    const page = await this.findOneOrNull(key);
    if (!page) {
      throw new NotFoundException('SEO page not found.');
    }
    return page;
  }

  async upsert(key: string, dto: UpdateSeoPageDto) {
    const metaTitle = dto.metaTitle?.trim() || null;
    const metaDescription = dto.metaDescription?.trim() || null;
    const metaKeywords = dto.metaKeywords?.trim() || null;

    return this.prisma.seoPage.upsert({
      where: { key },
      create: {
        key,
        metaTitle,
        metaDescription,
        metaKeywords,
      },
      update: {
        metaTitle,
        metaDescription,
        metaKeywords,
      },
    });
  }
}

