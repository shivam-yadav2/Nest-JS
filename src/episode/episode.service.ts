import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Episode } from '../series/entities/episode.entity';
import { Season } from '../series/entities/season.entity';
import { Series } from '../series/entities/series.entity';
import { VideoQuality } from '../series/entities/video-quality.entity';
import { RecentEpisodesQueryDto } from './dto/recent-episodes-query.dto';
import { SeasonEpisodesQueryDto } from './dto/season-episodes-query.dto';

@Injectable()
export class EpisodeService {
  constructor(
    @InjectModel(Episode) private readonly episodeModel: typeof Episode,
    @InjectModel(Series) private readonly seriesModel: typeof Series,
    private readonly configService: ConfigService,
  ) {}

  async getEpisodeById(episodeId: number) {
    const episode = await this.episodeModel.findByPk(episodeId, {
      include: [
        {
          model: Season,
          as: 'season',
          include: [{ model: Series, as: 'series' }],
        },
        {
          model: VideoQuality,
          as: 'videoQualities',
          where: { isReady: true },
          required: false,
        },
      ],
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    return episode;
  }

  async getEpisodeVideoMetadata(episodeId: number) {
    const episode = await this.getEpisodeById(episodeId);

    if (episode.uploadStatus !== 'ready') {
      return {
        videoReady: false,
        uploadStatus: episode.uploadStatus,
        episodeId: episode.id,
        message: 'Video not ready yet',
        videoQualities: [],
      };
    }

    const hlsBasePath =
      this.configService.get<string>('video.hlsPath') ||
      process.env.VIDEO_HLS_PATH ||
      join(process.cwd(), 'uploads', 'hls');

    const masterPath = join(hlsBasePath, `episode_${episodeId}`, 'master.m3u8');
    const masterExists = existsSync(masterPath);

    return {
      videoReady: masterExists,
      uploadStatus: episode.uploadStatus,
      videoUrl: `/uploads/hls/episode_${episodeId}/master.m3u8`,
      hlsAvailable: masterExists,
      episode: {
        id: episode.id,
        title: episode.title,
        description: episode.description,
        durationSeconds: episode.durationSeconds,
        thumbnailUrl: episode.thumbnailUrl,
        episodeNumber: episode.episodeNumber,
      },
      series: episode.season?.series
        ? {
            id: episode.season.series.id,
            title: episode.season.series.title,
            slug: episode.season.series.slug,
          }
        : null,
      season: episode.season
        ? {
            id: episode.season.id,
            seasonNumber: episode.season.seasonNumber,
            title: episode.season.title,
          }
        : null,
      videoQualities:
        episode.videoQualities?.map((quality) => ({
          id: quality.id,
          qualityLabel: quality.qualityLabel,
          resolution: `${quality.resolutionWidth}x${quality.resolutionHeight}`,
          resolutionWidth: quality.resolutionWidth,
          resolutionHeight: quality.resolutionHeight,
          bitrateKbps: quality.bitrateKbps,
          fileUrl: quality.fileUrl,
          codec: quality.codec,
          containerFormat: quality.containerFormat,
        })) ?? [],
    };
  }

  async incrementViewCount(episodeId: number) {
    const episode = await this.episodeModel.findByPk(episodeId);

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    await episode.increment('viewCount', { by: 1 });

    if (episode.seriesId) {
      await this.seriesModel.increment('viewCount', {
        by: 1,
        where: { id: episode.seriesId },
      });
    }

    await episode.reload();

    return {
      episodeId: episode.id,
      viewCount: episode.viewCount,
    };
  }

  async getRecentEpisodes(query: RecentEpisodesQueryDto) {
    const limit = query.limit ?? 20;

    return this.episodeModel.findAll({
      where: {
        isActive: true,
        status: 'published',
      },
      include: [
        {
          model: Season,
          as: 'season',
          attributes: ['id', 'seasonNumber', 'title'],
          include: [{ model: Series, as: 'series', attributes: ['id', 'title', 'slug', 'posterUrl'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  async getEpisodesBySeason(seasonId: number, query: SeasonEpisodesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.episodeModel.findAndCountAll({
      where: { seasonId },
      offset,
      limit,
      include: [
        {
          model: VideoQuality,
          as: 'videoQualities',
        },
      ],
      order: [['episodeNumber', 'ASC']],
    });

    return {
      episodes: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit) || 1,
      },
    };
  }
}
