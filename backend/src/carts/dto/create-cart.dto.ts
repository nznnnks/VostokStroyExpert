import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CartStatus } from '@prisma/client';

export class CreateCartDto {
  @IsOptional()
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  appliedDiscountId?: string | null;

  @IsOptional()
  @IsEnum(CartStatus)
  status?: CartStatus;

  @IsOptional()
  @IsString()
  comment?: string | null;
}
