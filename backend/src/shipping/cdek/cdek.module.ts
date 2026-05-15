import { Module } from '@nestjs/common';
import { CdekController } from './cdek.controller';
import { CdekService } from './cdek.service';

@Module({
  controllers: [CdekController],
  providers: [CdekService],
})
export class CdekModule {}

