import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { Otp } from 'src/auth/entities/otp.entity';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminOptionalAuthGuard } from './guards/admin-optional-auth.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([Admin, Otp]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminJwtAuthGuard, AdminOptionalAuthGuard],
  exports: [AdminService, AdminJwtAuthGuard, AdminOptionalAuthGuard],
})
export class AdminModule {}
