import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EpisodeController } from './episode.controller';
import { EpisodeService } from './episode.service';
import { Episode } from '../series/entities/episode.entity';
import { Season } from '../series/entities/season.entity';
import { Series } from '../series/entities/series.entity';
import { VideoQuality } from '../series/entities/video-quality.entity';

@Module({
  imports: [SequelizeModule.forFeature([Episode, Season, Series, VideoQuality])],
  controllers: [EpisodeController],
  providers: [EpisodeService],
  exports: [EpisodeService],
})
export class EpisodeModule {}
