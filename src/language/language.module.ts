import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminModule } from '../admin/admin.module';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { Language } from './entities/language.entity';

@Module({
  imports: [SequelizeModule.forFeature([Language]), AdminModule],
  controllers: [LanguageController],
  providers: [LanguageService],
  exports: [LanguageService],
})
export class LanguageModule {}
