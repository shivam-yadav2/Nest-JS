import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindAndCountOptions, Includeable, Op, Order, WhereOptions } from 'sequelize';
import { Category } from '../category/entities/category.entity';
import { Genre } from '../genre/entities/genre.entity';
import { Language } from '../language/entities/language.entity';
import { SeriesQueryDto } from './dto/series-query.dto';
import { Episode } from './entities/episode.entity';
import { Season } from './entities/season.entity';
import { Series } from './entities/series.entity';
import { VideoQuality } from './entities/video-quality.entity';

@Injectable()
export class SeriesService {
  constructor(@InjectModel(Series) private readonly seriesModel: typeof Series) {}

  async getAllSeries(query: SeriesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: WhereOptions<Series> = {};
    if (query.contentType) where.contentType = query.contentType;
    if (query.status) where.status = query.status as Series['status'];
    if (query.seriesStatus) where.seriesStatus = query.seriesStatus;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.languageId) where.primaryLanguageId = query.languageId;

    const include: Includeable[] = [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: Language, as: 'primaryLanguage', attributes: ['id', 'name', 'code'] },
      {
        model: Genre,
        as: 'genres',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] },
      },
      {
        model: Season,
        as: 'seasons',
        attributes: ['id', 'seasonNumber', 'title'],
        where: { isActive: true },
        required: false,
      },
    ];

    if (query.genreId) {
      const genreInclude = include[2] as {
        where?: WhereOptions<Genre>;
        required?: boolean;
      };
      genreInclude.where = { id: query.genreId };
      genreInclude.required = true;
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const direction = (query.order ?? 'DESC').toUpperCase() as 'ASC' | 'DESC';
    const order: Order = [[sortBy, direction]];

    const findOptions: FindAndCountOptions<Series> = {
      where,
      include,
      limit,
      offset,
      order,
      distinct: true,
    };

    const { count, rows } = await this.seriesModel.findAndCountAll(findOptions);
    const totalPages = Math.ceil(Number(count) / limit) || 1;

    return {
      series: rows.map((series) => this.formatSeriesListItem(series)),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: Number(count),
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getTrendingSeries(limit: number) {
    const rows = await this.seriesModel.findAll({
      where: { isActive: true, isTrending: true, status: 'published' },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        {
          model: Genre,
          as: 'genres',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] },
        },
      ],
      order: [['viewCount', 'DESC']],
      limit,
    });

    return rows.map((series) => this.formatSeriesListItem(series));
  }

  async getFeaturedSeries(limit: number) {
    const rows = await this.seriesModel.findAll({
      where: { isActive: true, isFeatured: true, status: 'published' },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        {
          model: Genre,
          as: 'genres',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] },
        },
      ],
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      limit,
    });

    return rows.map((series) => this.formatSeriesListItem(series));
  }

  async getRecommendedSeries(limit: number) {
    // Phase-1 migration: match non-auth fallback with trending recommendations.
    const rows = await this.seriesModel.findAll({
      where: {
        isTrending: true,
        status: 'published',
        isActive: true,
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Language, as: 'primaryLanguage', attributes: ['id', 'name', 'code'] },
        {
          model: Genre,
          as: 'genres',
          through: { attributes: [] },
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [
        ['viewCount', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit,
    });

    return rows;
  }

  async searchSeries(searchQuery: string, page: number, limit: number) {
    const queryText = searchQuery?.trim();
    if (!queryText || queryText.length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${queryText}%`;

    const { count, rows } = await this.seriesModel.findAndCountAll({
      where: {
        isActive: true,
        status: 'published',
        [Op.or]: [
          { title: { [Op.like]: searchTerm } },
          { description: { [Op.like]: searchTerm } },
          { keywords: { [Op.like]: searchTerm } },
        ],
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        {
          model: Genre,
          as: 'genres',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
      order: [['viewCount', 'DESC']],
      distinct: true,
    });

    const totalPages = Math.ceil(Number(count) / limit) || 1;

    return {
      series: rows.map((series) => this.formatSeriesListItem(series)),
      query: queryText,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: Number(count),
        itemsPerPage: limit,
      },
    };
  }

  async getSeriesBySlug(slug: string) {
    const series = await this.seriesModel.findOne({
      where: { slug, isActive: true },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'description'] },
        { model: Language, as: 'primaryLanguage', attributes: ['id', 'name', 'code', 'nativeName'] },
        {
          model: Genre,
          as: 'genres',
          attributes: ['id', 'name', 'slug', 'colorCode'],
          through: { attributes: [] },
        },
        {
          model: Language,
          as: 'languages',
          attributes: ['id', 'name', 'code', 'nativeName'],
          through: { attributes: [] },
        },
      ],
    });

    if (!series) {
      throw new NotFoundException('Series not found');
    }

    const seasons = await Season.findAll({
      where: { seriesId: series.id, isActive: true },
      include: [
        {
          model: Episode,
          as: 'episodes',
          where: { isActive: true, status: 'published' },
          required: false,
          attributes: [
            'id',
            'episodeNumber',
            'title',
            'slug',
            'description',
            'durationSeconds',
            'thumbnailUrl',
            'coinCost',
            'isFree',
            'uploadStatus',
            'viewCount',
            'likeCount',
          ],
          separate: true,
          order: [['episodeNumber', 'ASC']],
        },
      ],
      order: [['seasonNumber', 'ASC']],
    });

    void series.increment('viewCount');

    return {
      id: series.id,
      title: series.title,
      slug: series.slug,
      description: series.description,
      longDescription: series.longDescription,
      posterUrl: series.posterUrl,
      bannerUrl: series.bannerUrl,
      thumbnailUrl: series.thumbnailUrl,
      trailerUrl: series.trailerUrl,
      contentType: series.contentType,
      seriesStatus: series.seriesStatus,
      releaseYear: series.releaseYear,
      ageRating: series.ageRating,
      imdbRating: series.imdbRating,
      isPremium: series.isPremium,
      baseCoinCost: series.baseCoinCost,
      totalSeasons: seasons.length || series.totalSeasons,
      totalEpisodes: series.totalEpisodes,
      viewCount: series.viewCount,
      likeCount: series.likeCount,
      isFeatured: series.isFeatured,
      isTrending: series.isTrending,
      metaTitle: series.metaTitle,
      metaDescription: series.metaDescription,
      keywords: series.keywords,
      category: series.category,
      genres: series.genres,
      primaryLanguage: series.primaryLanguage,
      languages: series.languages,
      seasons: seasons.map((season) => ({
        id: season.id,
        seasonNumber: season.seasonNumber,
        title: season.title,
        description: season.description,
        posterUrl: season.posterUrl,
        releaseYear: season.releaseYear,
        totalEpisodes: season.episodes?.length || season.totalEpisodes,
        episodes:
          season.episodes?.map((episode) => ({
            id: episode.id,
            episodeNumber: episode.episodeNumber,
            title: episode.title,
            slug: episode.slug,
            description: episode.description,
            durationSeconds: episode.durationSeconds,
            thumbnailUrl: episode.thumbnailUrl,
            coinCost: episode.coinCost,
            isFree: episode.isFree,
            uploadStatus: episode.uploadStatus,
            viewCount: episode.viewCount,
            likeCount: episode.likeCount,
          })) ?? [],
      })),
    };
  }

  async getSeasonWithEpisodes(seriesSlug: string, seasonNumber: number) {
    const series = await this.seriesModel.findOne({
      where: { slug: seriesSlug, isActive: true },
      attributes: ['id', 'title', 'slug', 'posterUrl', 'bannerUrl'],
    });

    if (!series) {
      throw new NotFoundException('Series not found');
    }

    const season = await Season.findOne({
      where: { seriesId: series.id, seasonNumber, isActive: true },
      include: [
        {
          model: Episode,
          as: 'episodes',
          where: { isActive: true, status: 'published' },
          required: false,
          include: [
            {
              model: VideoQuality,
              as: 'videoQualities',
              attributes: ['id', 'qualityLabel', 'resolutionWidth', 'resolutionHeight', 'fileUrl'],
            },
          ],
          separate: true,
          order: [['episodeNumber', 'ASC']],
        },
      ],
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    return {
      id: season.id,
      seasonNumber: season.seasonNumber,
      title: season.title,
      description: season.description,
      posterUrl: season.posterUrl,
      bannerUrl: season.bannerUrl,
      releaseYear: season.releaseYear,
      totalEpisodes: season.episodes?.length || season.totalEpisodes,
      series,
      episodes:
        season.episodes?.map((episode) => ({
          id: episode.id,
          episodeNumber: episode.episodeNumber,
          title: episode.title,
          slug: episode.slug,
          description: episode.description,
          durationSeconds: episode.durationSeconds,
          fileSizeMb: episode.fileSizeMb,
          thumbnailUrl: episode.thumbnailUrl,
          previewUrl: episode.previewUrl,
          coinCost: episode.coinCost,
          isFree: episode.isFree,
          freeUntil: episode.freeUntil,
          uploadStatus: episode.uploadStatus,
          viewCount: episode.viewCount,
          likeCount: episode.likeCount,
          videoQualities: episode.videoQualities,
        })) ?? [],
    };
  }

  async getEpisodeDetails(seriesSlug: string, seasonNumber: number, episodeNumber: number) {
    const series = await this.seriesModel.findOne({
      where: { slug: seriesSlug, isActive: true },
      attributes: ['id', 'title', 'slug'],
    });

    if (!series) {
      throw new NotFoundException('Series not found');
    }

    const season = await Season.findOne({
      where: { seriesId: series.id, seasonNumber, isActive: true },
      attributes: ['id', 'seasonNumber', 'title'],
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    const episode = await Episode.findOne({
      where: {
        seriesId: series.id,
        seasonId: season.id,
        episodeNumber,
        isActive: true,
        status: 'published',
      },
      include: [
        {
          model: VideoQuality,
          as: 'videoQualities',
          attributes: ['id', 'qualityLabel', 'resolutionWidth', 'resolutionHeight', 'fileUrl'],
        },
      ],
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    void episode.increment('viewCount');

    return {
      id: episode.id,
      episodeNumber: episode.episodeNumber,
      title: episode.title,
      slug: episode.slug,
      description: episode.description,
      durationSeconds: episode.durationSeconds,
      fileSizeMb: episode.fileSizeMb,
      thumbnailUrl: episode.thumbnailUrl,
      previewUrl: episode.previewUrl,
      coinCost: episode.coinCost,
      isFree: episode.isFree,
      freeUntil: episode.freeUntil,
      uploadStatus: episode.uploadStatus,
      viewCount: episode.viewCount,
      likeCount: episode.likeCount,
      series,
      season,
      videoQualities: episode.videoQualities,
    };
  }

  private formatSeriesListItem(series: Series) {
    return {
      id: series.id,
      title: series.title,
      slug: series.slug,
      description: series.description,
      posterUrl: series.posterUrl,
      bannerUrl: series.bannerUrl,
      thumbnailUrl: series.thumbnailUrl,
      contentType: series.contentType,
      seriesStatus: series.seriesStatus,
      releaseYear: series.releaseYear,
      ageRating: series.ageRating,
      imdbRating: series.imdbRating,
      isPremium: series.isPremium,
      baseCoinCost: series.baseCoinCost,
      totalSeasons: series.seasons?.length || series.totalSeasons,
      totalEpisodes: series.totalEpisodes,
      viewCount: series.viewCount,
      likeCount: series.likeCount,
      isFeatured: series.isFeatured,
      isTrending: series.isTrending,
      category: series.category,
      genres: series.genres,
      primaryLanguage: series.primaryLanguage,
    };
  }
}
