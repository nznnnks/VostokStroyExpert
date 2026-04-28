import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AdminAccess } from '../auth/decorators/admin-access.decorator';
import { ListRecentDto } from './dto/list-recent.dto';
import { SendMailDto } from './dto/send-mail.dto';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('health')
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  health() {
    return this.mailService.testConnections();
  }

  @Get('inbox/recent')
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  listRecent(@Query() query: ListRecentDto) {
    return this.mailService.listRecentInbox(query.limit ?? 10);
  }

  @Post('send')
  @AdminAccess(UserRole.SUPERADMIN, UserRole.MANAGER)
  send(@Body() dto: SendMailDto) {
    if (!dto.text && !dto.html) {
      return this.mailService.sendMail({
        to: dto.to,
        subject: dto.subject,
        text: '',
      });
    }

    return this.mailService.sendMail(dto);
  }
}

