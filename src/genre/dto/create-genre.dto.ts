import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  colorCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
