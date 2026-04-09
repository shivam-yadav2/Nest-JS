import { IsNotEmpty, IsNumber , IsString  } from "class-validator";
 


export class VerifyOtpDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsString()
    code: string;
}