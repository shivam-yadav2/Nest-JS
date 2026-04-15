import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Admin } from './entities/admin.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Otp } from 'src/auth/entities/otp.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { AdminRequestOtpDto } from './dto/admin-request-otp.dto';
import { AdminVerifyOtpDto } from './dto/admin-verify-otp.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { OtpType } from 'src/auth/entities/otp.entity';


@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin) private adminModel: typeof Admin,
    @InjectModel(Otp) private otpModel: typeof Otp,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOtp(phone: string, otp: string): Promise<void> {
    // TODO: integrate SMS provider.
    console.log(`Admin OTP for ${phone}: ${otp}`);
  }

  private toPublicAdmin(admin: Admin | null): AdminResponseDto {
    if (!admin) {
      return null as never;
    }

    return {
      id: admin.id,
      name: admin.name ?? undefined,
      email: admin.email ?? undefined,
      phone: admin.phone,
      role: admin.role,
      isActive: admin.isActive,
      isVerified: admin.isVerified,
      lastLoginAt: admin.lastLoginAt ?? undefined,
    };
  }

  async requestOtp(dto: AdminRequestOtpDto): Promise<{ adminId: number }> {
    const phone = dto.phone?.trim();
    const password = dto.password?.trim();

    if (!phone || !password) {
      throw new BadRequestException('Phone and password required');
    }

    const admin = await this.adminModel.findOne({ where: { phone } });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new ForbiddenException('Admin account is deactivated');
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const otpCode = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.otpModel.create({
      adminId: admin.id,
      userId: null,
      code: otpCode,
      type: OtpType.PHONE,
      expiresAt,
    });

    await this.sendOtp(phone, otpCode);

    return { adminId: admin.id };
  }

  async verifyOtp(
    dto: AdminVerifyOtpDto,
  ): Promise<{ admin: AdminResponseDto; accessToken: string }> {
    const otp = await this.otpModel.findOne({
      where: {
        adminId: dto.adminId,
        code: dto.code,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    otp.isUsed = true;
    await otp.save();

    const admin = await this.adminModel.findByPk(dto.adminId);

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (!admin.isActive) {
      throw new ForbiddenException('Admin account is deactivated');
    }

    admin.isVerified = true;
    admin.lastLoginAt = new Date();
    await admin.save();

    const accessToken = this.generateAccessToken(admin.id, admin.role);
    return {
      admin: this.toPublicAdmin(admin),
      accessToken,
    };
  }

  async getCurrentAdmin(adminId: number): Promise<AdminResponseDto> {
    const admin = await this.adminModel.findByPk(adminId);

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (!admin.isActive) {
      throw new ForbiddenException('Admin account is deactivated');
    }

    return this.toPublicAdmin(admin);
  }

  private generateAccessToken(adminId: number, role = 'admin'): string {
    const secret = this.configService.get<string>('jwt.secret');
    const expiresIn = (this.configService.get<string>('jwt.expiresIn') || '7d') as StringValue;

    return this.jwtService.sign(
      { adminId, role },
      {
        secret,
        expiresIn,
      },
    );
  }
}
