import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { SeriesService } from './series.service';
import { Series } from './entities/series.entity';

describe('SeriesService', () => {
  let service: SeriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        {
          provide: getModelToken(Series),
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findAndCountAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SeriesService>(SeriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
