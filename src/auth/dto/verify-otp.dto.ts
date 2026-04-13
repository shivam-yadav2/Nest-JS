import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsString()
  code: string;
}
