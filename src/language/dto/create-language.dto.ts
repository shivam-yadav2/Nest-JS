import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(10)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nativeName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
