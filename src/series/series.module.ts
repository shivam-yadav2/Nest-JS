import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { Category } from '../category/entities/category.entity';
import { Genre } from '../genre/entities/genre.entity';
import { Language } from '../language/entities/language.entity';
import { Episode } from './entities/episode.entity';
import { Season } from './entities/season.entity';
import { SeriesGenre } from './entities/series-genre.entity';
import { SeriesLanguage } from './entities/series-language.entity';
import { Series } from './entities/series.entity';
import { VideoQuality } from './entities/video-quality.entity';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([
      Series,
      Season,
      Episode,
      VideoQuality,
      SeriesGenre,
      SeriesLanguage,
      Category,
      Genre,
      Language,
    ]),
  ],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
