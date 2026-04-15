import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModuleCustom } from './config/config.module';
import { databaseConfig } from './config/database.config';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, ConfigModuleCustom, databaseConfig, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
