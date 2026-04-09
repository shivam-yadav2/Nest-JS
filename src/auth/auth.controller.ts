// src/auth/auth.controller.ts
import { Controller, Post, Get, Put, Body, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestOtpDto, VerifyOtpDto, UpdateProfileDto, UserResponseDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-phone')
  async requestOtp(@Body() dto: RequestOtpDto) {
    const result = await this.authService.requestOtp(dto);
    return {
      success: true,
      data: result,
      message: 'OTP sent successfully',
    };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res() res: Response) {
    const result = await this.authService.verifyOtp(dto);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    res.cookie('accessToken', result.accessToken, options);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'OTP verified successfully',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req: any): Promise<{ success: boolean; data: UserResponseDto; message: string }> {
    const user = await this.authService.getCurrentUser(req.user.id);
    return {
      success: true,
      data: user,
      message: 'User fetched successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const user = await this.authService.updateProfile(req.user.id, dto);
    return {
      success: true,
      data: user,
      message: 'Profile updated successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res() res: Response) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    res.clearCookie('accessToken', options);
    res.status(HttpStatus.OK).json({
      success: true,
      data: null,
      message: 'Logged out successfully',
    });
  }
}