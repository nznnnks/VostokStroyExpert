import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class RequestPasswordResetDto {
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email!: string;
}

