import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

import { CreateEmbeddedClientProfileDto } from './create-user.dto';

export class UpdateEmbeddedClientProfileDto extends PartialType(CreateEmbeddedClientProfileDto) {}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('RU')
  phone?: string;

  @IsOptional()
  @IsString()
  passwordHash?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmbeddedClientProfileDto)
  clientProfile?: UpdateEmbeddedClientProfileDto;
}
