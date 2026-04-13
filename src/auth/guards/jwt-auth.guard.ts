import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Unauthorized request');
    }

    try {
      const payload = this.jwtService.verify<{ userId: number }>(token);
      const user = await this.userModel.findByPk(payload.userId, {
        attributes: { exclude: ['passwordHash'] },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid accessToken');
      }

      request.user = user;
      return true;
    } catch (error) {
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