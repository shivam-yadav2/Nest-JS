import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModuleCustom } from './config/config.module';
import { databaseConfig } from './config/database.config';
import { AdminModule } from './admin/admin.module';
import { CategoryModule } from './category/category.module';
import { GenreModule } from './genre/genre.module';
import { LanguageModule } from './language/language.module';
import { SeriesModule } from './series/series.module';
import { EpisodeModule } from './episode/episode.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    AuthModule,
    ConfigModuleCustom,
    databaseConfig,
    AdminModule,
    CategoryModule,
    GenreModule,
    LanguageModule,
    SeriesModule,
    EpisodeModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
