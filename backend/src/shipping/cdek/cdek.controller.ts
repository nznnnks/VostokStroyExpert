import { Body, Controller, Post } from '@nestjs/common';
import { CdekQuoteRequestDto } from './dto/cdek-quote.dto';
import { CdekService } from './cdek.service';

@Controller('shipping/cdek')
export class CdekController {
  constructor(private readonly cdekService: CdekService) {}

  @Post('quote')
  async quote(@Body() dto: CdekQuoteRequestDto) {
    const itemsCount = dto.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return this.cdekService.getBestQuote({
      toPostalCode: dto.toPostalCode,
      toCity: dto.toCity,
      itemsCount,
    });
  }
}

