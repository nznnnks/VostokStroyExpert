import { Body, Controller, Post } from '@nestjs/common';
import { CdekQuoteRequestDto } from './dto/cdek-quote.dto';
import { CdekService } from './cdek.service';

@Controller('shipping/cdek')
export class CdekController {
  constructor(private readonly cdekService: CdekService) {}

  @Post('quote')
  async quote(@Body() dto: CdekQuoteRequestDto) {
    return this.cdekService.getBestQuote({
      toPostalCode: dto.toPostalCode,
      toCity: dto.toCity,
      items: dto.items,
    });
  }
}
