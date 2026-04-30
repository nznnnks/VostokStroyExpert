import { IsObject, IsOptional, IsString } from 'class-validator';

export class YooKassaWebhookObjectDto {
  @IsString()
  id!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  amount?: {
    value?: string;
    currency?: string;
  };

  @IsOptional()
  paid?: boolean;

  @IsOptional()
  captured_at?: string;
}

export class YooKassaWebhookDto {
  @IsString()
  type!: string;

  @IsString()
  event!: string;

  @IsObject()
  object!: YooKassaWebhookObjectDto;
}
