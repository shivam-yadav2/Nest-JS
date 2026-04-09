import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModuleCustom } from './config/config.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [AuthModule, ConfigModuleCustom, databaseConfig],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
