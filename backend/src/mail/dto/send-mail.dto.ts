import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendMailDto {
  @IsEmail()
  to!: string;

  @IsString()
  @MaxLength(200)
  subject!: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  html?: string;
}

