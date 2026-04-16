import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class InitializeUploadDto {
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  fileSize!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  episodeId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalChunks?: number;
}
