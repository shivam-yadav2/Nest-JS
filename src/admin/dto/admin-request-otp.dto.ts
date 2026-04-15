import { IsNotEmpty, IsString } from 'class-validator';

export class AdminRequestOtpDto {
    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}