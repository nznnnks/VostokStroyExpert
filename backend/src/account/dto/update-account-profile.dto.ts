import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { UpdateEmbeddedClientProfileDto } from '../../users/dto/update-user.dto';

export class UpdateAccountProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('RU')
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEmbeddedClientProfileDto)
  clientProfile?: UpdateEmbeddedClientProfileDto;
}
