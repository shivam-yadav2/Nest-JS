import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { EpisodeService } from './episode.service';
import { Episode } from '../series/entities/episode.entity';
import { Series } from '../series/entities/series.entity';

describe('EpisodeService', () => {
  let service: EpisodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpisodeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getModelToken(Episode),
          useValue: {
            findByPk: jest.fn(),
            findAll: jest.fn(),
            findAndCountAll: jest.fn(),
          },
        },
        {
          provide: getModelToken(Series),
          useValue: {
            increment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EpisodeService>(EpisodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
