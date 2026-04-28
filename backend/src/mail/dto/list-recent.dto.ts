import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListRecentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

