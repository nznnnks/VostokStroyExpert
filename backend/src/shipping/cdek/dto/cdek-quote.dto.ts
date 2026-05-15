import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CdekQuoteItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CdekQuoteRequestDto {
  @IsOptional()
  @IsString()
  toPostalCode?: string;

  @IsOptional()
  @IsString()
  toCity?: string;

  @IsOptional()
  @IsString()
  toAddress?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CdekQuoteItemDto)
  items!: CdekQuoteItemDto[];
}

export class CdekQuoteResponseDto {
  price!: number;
  currency!: string;
  periodMin?: number;
  periodMax?: number;
  tariffCode?: number;
  tariffName?: string;
}

