import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from '../entities/admin.entity';

type AdminJwtPayload = {
  adminId: number;
  role?: string;
};

@Injectable()
export class AdminJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Admin) private adminModel: typeof Admin,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Unauthorized request');
    }

    try {
      const payload = this.jwtService.verify<AdminJwtPayload>(token);

      if (!payload?.adminId) {
        throw new UnauthorizedException('Invalid accessToken');
      }

      if (payload.role && payload.role !== 'admin') {
        throw new ForbiddenException('Forbidden - Admin access required');
      }

      const admin = await this.adminModel.findByPk(payload.adminId, {
        attributes: { exclude: ['passwordHash'] },
      });

      if (!admin) {
        throw new UnauthorizedException('Invalid accessToken');
      }

      if (!admin.isActive) {
        throw new ForbiddenException('Admin account is deactivated');
      }

      if (admin.role !== 'admin') {
        throw new ForbiddenException('Forbidden - Admin access required');
      }

      request.admin = admin;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new UnauthorizedException(error.message);
    }
  }

  private extractTokenFromRequest(request: any): string | null {
    let token = request.cookies?.accessToken;

    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else if (authHeader) {
        token = authHeader.trim();
      }
    }

    return token || null;
  }
}
