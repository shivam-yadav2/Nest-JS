import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { SeriesQueryDto } from './dto/series-query.dto';
import { SeriesService } from './series.service';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async getAllSeries(@Query() query: SeriesQueryDto) {
    const data = await this.seriesService.getAllSeries(query);

    return {
      success: true,
      data,
      message: 'Series fetched successfully',
    };
  }

  @Get('trending')
  async getTrendingSeries(@Query('limit') limit?: string) {
    const parsedLimit = this.toPositiveInt(limit, 10);
    const data = await this.seriesService.getTrendingSeries(parsedLimit);

    return {
      success: true,
      data,
      message: 'Trending series fetched successfully',
    };
  }

  @Get('featured')
  async getFeaturedSeries(@Query('limit') limit?: string) {
    const parsedLimit = this.toPositiveInt(limit, 10);
    const data = await this.seriesService.getFeaturedSeries(parsedLimit);

    return {
      success: true,
      data,
      message: 'Featured series fetched successfully',
    };
  }

  @UseGuards(OptionalAuthGuard)
  @Get('recommended')
  async getRecommendedSeries(@Query('limit') limit?: string) {
    const parsedLimit = this.toPositiveInt(limit, 20);
    const data = await this.seriesService.getRecommendedSeries(parsedLimit);

    return {
      success: true,
      data,
      message: 'Recommended series fetched successfully',
    };
  }

  @Get('search')
  async searchSeries(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = this.toPositiveInt(page, 1);
    const parsedLimit = this.toPositiveInt(limit, 20);
    const data = await this.seriesService.searchSeries(query, parsedPage, parsedLimit);

    return {
      success: true,
      data,
      message: 'Series search completed',
    };
  }

  @Get(':slug')
  async getSeriesBySlug(@Param('slug') slug: string) {
    const data = await this.seriesService.getSeriesBySlug(slug);

    return {
      success: true,
      data,
      message: 'Series details fetched successfully',
    };
  }

  @Get(':seriesSlug/seasons/:seasonNumber')
  async getSeasonWithEpisodes(
    @Param('seriesSlug') seriesSlug: string,
    @Param('seasonNumber') seasonNumberRaw: string,
  ) {
    const seasonNumber = this.toPositiveInt(seasonNumberRaw, 1);
    const data = await this.seriesService.getSeasonWithEpisodes(seriesSlug, seasonNumber);

    return {
      success: true,
      data,
      message: 'Season details fetched successfully',
    };
  }

  @Get(':seriesSlug/seasons/:seasonNumber/episodes/:episodeNumber')
  async getEpisodeDetails(
    @Param('seriesSlug') seriesSlug: string,
    @Param('seasonNumber') seasonNumberRaw: string,
    @Param('episodeNumber') episodeNumberRaw: string,
  ) {
    const seasonNumber = this.toPositiveInt(seasonNumberRaw, 1);
    const episodeNumber = this.toPositiveInt(episodeNumberRaw, 1);
    const data = await this.seriesService.getEpisodeDetails(
      seriesSlug,
      seasonNumber,
      episodeNumber,
    );

    return {
      success: true,
      data,
      message: 'Episode details fetched successfully',
    };
  }

  private toPositiveInt(value: string | undefined, defaultValue: number): number {
    if (!value) {
      return defaultValue;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return defaultValue;
    }

    return parsed;
  }
}
