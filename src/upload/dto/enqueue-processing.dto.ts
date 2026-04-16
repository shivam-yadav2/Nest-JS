import { IsOptional, IsString, MaxLength } from 'class-validator';

export class EnqueueProcessingDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  inputPath?: string;
}
