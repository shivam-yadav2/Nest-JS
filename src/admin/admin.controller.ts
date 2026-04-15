import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AdminService } from './admin.service';
import { AdminRequestOtpDto } from './dto/admin-request-otp.dto';
import { AdminVerifyOtpDto } from './dto/admin-verify-otp.dto';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminResponseDto } from './dto/admin-response.dto';

@Controller('admin/auth')
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Post('request-otp')
	async requestOtp(@Body() dto: AdminRequestOtpDto) {
		const result = await this.adminService.requestOtp(dto);

		return {
			success: true,
			data: result,
			message: 'OTP sent successfully',
		};
	}

	@Post('verify-otp')
	async verifyOtp(@Body() dto: AdminVerifyOtpDto, @Res({ passthrough: true }) reply: FastifyReply) {
		const result = await this.adminService.verifyOtp(dto);

		const options = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			path: '/',
		};

		reply.setCookie('accessToken', result.accessToken, options);

		return {
			success: true,
			data: result,
			message: 'OTP verified successfully',
		};
	}

	@UseGuards(AdminJwtAuthGuard)
	@Get('me')
	async getCurrentAdmin(@Req() req: any): Promise<{ success: boolean; data: AdminResponseDto; message: string }> {
		const admin = await this.adminService.getCurrentAdmin(req.admin.id);

		return {
			success: true,
			data: admin,
			message: 'Admin fetched successfully',
		};
	}

	@UseGuards(AdminJwtAuthGuard)
	@Post('logout')
	async logout(@Res({ passthrough: true }) reply: FastifyReply) {
		const options = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			path: '/',
		};

		reply.clearCookie('accessToken', options);

		return {
			success: true,
			data: null,
			message: 'Logged out successfully',
		};
	}
}
