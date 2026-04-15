import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AdminVerifyOtpDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  adminId: number;

  @IsNotEmpty()
  @IsString()
  code: string;
}
