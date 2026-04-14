import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Otp, OtpType } from './entities/otp.entity';
import { RequestOtpDto } from './dto/request-otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Otp) private otpModel: typeof Otp,
    private configService: ConfigService,
    private jwtService: JwtService,
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

  private toPublicUser(user: User | null): UserResponseDto {
    if (!user) {
      return null as never;
    }

    return {
      id: user.id,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      displayName: user.displayName ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      locale: user.locale,
      isActive: user.isActive,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt ?? undefined,
    };
  }

  async requestOtp(dto: RequestOtpDto): Promise<{ userId: number }> {
    const phone = dto.phone?.trim();

    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    let user = await this.userModel.findOne({ where: { phone } });
    if (!user) {
      user = await this.userModel.create({ phone });
    }

    const otpCode = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.otpModel.create({
      userId: user.id,
      code: otpCode,
      type: OtpType.PHONE,
      expiresAt,
    });

    await this.sendOtp(phone, otpCode);

    return { userId: user.id };
  }

  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<{ user: UserResponseDto; accessToken: string }> {
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

    const loggedInUser = await this.userModel.findByPk(dto.userId);

    return { user: this.toPublicUser(loggedInUser), accessToken };
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
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

    const candidatePhone = dto.phone?.trim();
    if (candidatePhone && candidatePhone !== user.phone) {
      const existingPhoneUser = await this.userModel.findOne({
        where: {
          phone: candidatePhone,
          id: { [Op.ne]: userId },
        },
      });

      if (existingPhoneUser) {
        throw new ConflictException({
          message: 'Phone already exists',
          error: 'DUPLICATE_PHONE',
          details: [{ field: 'phone', message: 'phone already exists' }],
        });
      }
    }

    const candidateEmail = dto.email?.trim();
    if (candidateEmail && candidateEmail !== user.email) {
      const existingEmailUser = await this.userModel.findOne({
        where: {
          email: candidateEmail,
          id: { [Op.ne]: userId },
        },
      });

      if (existingEmailUser) {
        throw new ConflictException({
          message: 'Email already exists',
          error: 'DUPLICATE_EMAIL',
          details: [{ field: 'email', message: 'email already exists' }],
        });
      }
    }

    await user.update(updateData);

    const updatedUser = await this.userModel.findByPk(userId);

    return this.toPublicUser(updatedUser);
  }

  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  private generateAccessToken(userId: number): string {
    const secret = this.configService.get<string>('jwt.secret');
    return this.jwtService.sign({ userId }, { secret, expiresIn: '7d' });
  }
}
