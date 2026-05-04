import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ConfirmPasswordResetDto {
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email!: string;

  @IsString()
  @Length(6, 6)
  code!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(6)
  passwordRepeat!: string;
}

