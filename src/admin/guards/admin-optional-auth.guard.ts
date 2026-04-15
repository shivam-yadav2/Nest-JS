import { ExecutionContext, Injectable } from '@nestjs/common';
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard';

@Injectable()
export class AdminOptionalAuthGuard extends AdminJwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await super.canActivate(context);
    } catch {
      return true;
    }
  }
}
