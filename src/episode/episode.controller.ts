import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { RecentEpisodesQueryDto } from './dto/recent-episodes-query.dto';
import { SeasonEpisodesQueryDto } from './dto/season-episodes-query.dto';

@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get('season/:seasonId')
  async getEpisodesBySeason(
    @Param('seasonId', ParseIntPipe) seasonId: number,
    @Query() query: SeasonEpisodesQueryDto,
  ) {
    const data = await this.episodeService.getEpisodesBySeason(seasonId, query);

    return {
      success: true,
      data,
      message: 'Episodes by season fetched successfully',
    };
  }

  @Get('recent')
  async getRecentEpisodes(@Query() query: RecentEpisodesQueryDto) {
    const data = await this.episodeService.getRecentEpisodes(query);

    return {
      success: true,
      data,
      message: 'Recent episodes fetched successfully',
    };
  }

  @Get(':episodeId/video')
  async getEpisodeVideo(@Param('episodeId', ParseIntPipe) episodeId: number) {
    const data = await this.episodeService.getEpisodeVideoMetadata(episodeId);

    return {
      success: true,
      data,
      message: 'Episode playback metadata fetched successfully',
    };
  }

  @Get(':episodeId')
  async getEpisode(@Param('episodeId', ParseIntPipe) episodeId: number) {
    const data = await this.episodeService.getEpisodeById(episodeId);

    return {
      success: true,
      data,
      message: 'Episode fetched successfully',
    };
  }

  @Post(':episodeId/view')
  async incrementViewCount(@Param('episodeId', ParseIntPipe) episodeId: number) {
    const data = await this.episodeService.incrementViewCount(episodeId);

    return {
      success: true,
      data,
      message: 'Episode view count incremented',
    };
  }
}
