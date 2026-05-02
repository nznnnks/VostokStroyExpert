import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AdminAccess } from '../auth/decorators/admin-access.decorator';
import { UpdateSeoPageDto } from './dto/update-seo-page.dto';
import { SeoPagesService } from './seo-pages.service';

@Controller('seo-pages')
export class SeoPagesController {
  constructor(private readonly seoPagesService: SeoPagesService) {}

  @Get()
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.EDITOR)
  findAll() {
    return this.seoPagesService.findAll();
  }

  @Get(':key')
  async findOne(@Param('key') key: string) {
    const page = await this.seoPagesService.findOneOrNull(key);
    return (
      page ?? {
        key,
        metaTitle: null,
        metaDescription: null,
        metaKeywords: null,
      }
    );
  }

  @Patch(':key')
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.EDITOR)
  upsert(@Param('key') key: string, @Body() dto: UpdateSeoPageDto) {
    return this.seoPagesService.upsert(key, dto);
  }
}

