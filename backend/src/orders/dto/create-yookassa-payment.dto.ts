import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateYooKassaPaymentDto {
  @IsUUID()
  orderId!: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;
}
