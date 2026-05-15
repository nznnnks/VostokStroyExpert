import { Module } from '@nestjs/common';
import { CdekModule } from './cdek/cdek.module';

@Module({
  imports: [CdekModule],
})
export class ShippingModule {}

