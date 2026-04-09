// src/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Otp, OtpType } from './entities/otp.entity';
import { RequestOtpDto, VerifyOtpDto, UpdateProfileDto, UserResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Otp) private otpModel: typeof Otp,
    private configService: ConfigService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async sendOtp(phone: string, otp: string): Promise<void> {
    // TODO: Integrate SMS service (e.g., SmartPing)
    console.log(`User OTP for ${phone}: ${otp}`);
    // For now, just log it
  }

  async requestOtp(dto: RequestOtpDto): Promise<{ userId: number }> {
    let user = await this.userModel.findOne({ where: { phone: dto.phone } });
    if (!user) {
      user = await this.userModel.create({ phone: dto.phone });
    }

    const otpCode = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.otpModel.create({
      userId: user.id,
      code: otpCode,
      type: OtpType.PHONE,
      expiresAt,
    });

    await this.sendOtp(dto.phone, otpCode);

    return { userId: user.id };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ user: UserResponseDto; accessToken: string }> {
    const otp = await this.otpModel.findOne({
      where: {
        userId: dto.userId,
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

    const user = await this.userModel.findByPk(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isVerified = true;
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = this.generateAccessToken(user.id);

    const loggedInUser = await this.userModel.findByPk(dto.userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    return { user: loggedInUser.toJSON() as UserResponseDto, accessToken };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: Partial<User> = {
      displayName: dto.displayName?.trim() || user.displayName,
      avatarUrl: dto.avatarUrl?.trim() || user.avatarUrl,
      locale: dto.locale?.trim() || user.locale,
      email: dto.email?.trim() || user.email,
      phone: dto.phone?.trim() || user.phone,
    };

    if (dto.password?.trim()) {
      updateData.passwordHash = await this.hashPassword(dto.password);
    }

    await user.update(updateData);

    const updatedUser = await this.userModel.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    return updatedUser.toJSON() as UserResponseDto;
  }

  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    const user = await this.userModel.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.toJSON() as UserResponseDto;
  }

  private generateAccessToken(userId: number): string {
    const secret = this.configService.get<string>('jwt.secret');
    return jwt.sign({ userId }, secret, { expiresIn: '7d' });
  }
} 