import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSeoPageDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  metaKeywords?: string;
}

