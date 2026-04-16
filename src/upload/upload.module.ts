import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminModule } from '../admin/admin.module';
import { Episode } from '../series/entities/episode.entity';
import { VideoQuality } from '../series/entities/video-quality.entity';
import { TranscodingJob } from './entities/transcoding-job.entity';
import { UploadSession } from './entities/upload-session.entity';
import { VideoProcessingProcessor } from './processors/video-processing.processor';
import { VIDEO_PROCESSING_QUEUE } from './queues/video-processing.constants';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    AdminModule,
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host') || '127.0.0.1',
          port: configService.get<number>('redis.port') || 6379,
        },
      }),
    }),
    BullModule.registerQueue({
      name: VIDEO_PROCESSING_QUEUE,
    }),
    SequelizeModule.forFeature([
      UploadSession,
      TranscodingJob,
      Episode,
      VideoQuality,
    ]),
  ],
  controllers: [UploadController],
  providers: [UploadService, VideoProcessingProcessor],
  exports: [UploadService],
})
export class UploadModule {}
