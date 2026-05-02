import { Module } from '@nestjs/common';

import { SeoPagesController } from './seo-pages.controller';
import { SeoPagesService } from './seo-pages.service';

@Module({
  controllers: [SeoPagesController],
  providers: [SeoPagesService],
})
export class SeoPagesModule {}

