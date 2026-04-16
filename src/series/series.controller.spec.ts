import { Test, TestingModule } from '@nestjs/testing';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';

describe('SeriesController', () => {
  let controller: SeriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeriesController],
      providers: [
        {
          provide: SeriesService,
          useValue: {
            getAllSeries: jest.fn(),
            getTrendingSeries: jest.fn(),
            getFeaturedSeries: jest.fn(),
            getRecommendedSeries: jest.fn(),
            searchSeries: jest.fn(),
            getSeriesBySlug: jest.fn(),
            getSeasonWithEpisodes: jest.fn(),
            getEpisodeDetails: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SeriesController>(SeriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
