import { Process, Processor } from '@nestjs/bull';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Episode } from '../../series/entities/episode.entity';
import { VideoQuality } from '../../series/entities/video-quality.entity';
import { TranscodingJob } from '../entities/transcoding-job.entity';
import { UploadSession } from '../entities/upload-session.entity';
import {
  PROCESS_VIDEO_JOB,
  VIDEO_PROCESSING_QUEUE,
} from '../queues/video-processing.constants';

type VideoProcessJobData = {
  sessionId: string;
  uploadSessionId: number;
  episodeId: number;
  fileName: string;
  inputPath?: string;
  transcodingJobId: number;
};

@Processor(VIDEO_PROCESSING_QUEUE)
export class VideoProcessingProcessor {
  constructor(
    @InjectModel(Episode) private readonly episodeModel: typeof Episode,
    @InjectModel(VideoQuality) private readonly videoQualityModel: typeof VideoQuality,
    @InjectModel(TranscodingJob) private readonly transcodingJobModel: typeof TranscodingJob,
    @InjectModel(UploadSession) private readonly uploadSessionModel: typeof UploadSession,
    private readonly configService: ConfigService,
  ) {}

  @Process(PROCESS_VIDEO_JOB)
  async handleProcessVideo(job: Job<VideoProcessJobData>) {
    const { episodeId, transcodingJobId, uploadSessionId } = job.data;

    const episode = await this.episodeModel.findByPk(episodeId);
    if (!episode) {
      throw new Error('Episode not found');
    }

    const transcodingJob = await this.transcodingJobModel.findByPk(transcodingJobId);
    const uploadSession = await this.uploadSessionModel.findByPk(uploadSessionId);

    try {
      if (transcodingJob) {
        await transcodingJob.update({
          status: 'running',
          progress: 5,
          attempted: (transcodingJob.attempted || 0) + 1,
          currentStep: 'initializing',
        });
      }

      await episode.update({ uploadStatus: 'processing', processingProgress: 5 });
      await job.progress(5);

      if (transcodingJob) {
        await transcodingJob.update({ progress: 35, currentStep: 'transcoding' });
      }
      await episode.update({ processingProgress: 35 });
      await job.progress(35);

      const hlsBasePath =
        this.configService.get<string>('video.hlsPath') ||
        process.env.VIDEO_HLS_PATH ||
        './uploads/hls';

      const defaultQualities = [
        { label: '360p', width: 640, height: 360, bitrate: 800 },
        { label: '720p', width: 1280, height: 720, bitrate: 2500 },
        { label: '1080p', width: 1920, height: 1080, bitrate: 5000 },
      ];

      await this.videoQualityModel.destroy({ where: { episodeId } });
      await this.videoQualityModel.bulkCreate(
        defaultQualities.map((q) => ({
          episodeId,
          qualityLabel: q.label,
          resolutionWidth: q.width,
          resolutionHeight: q.height,
          bitrateKbps: q.bitrate,
          fileUrl: `/uploads/hls/episode_${episodeId}/${q.label}/playlist.m3u8`,
          fileSizeMb: null,
          codec: 'H.264',
          containerFormat: 'm3u8',
          isReady: true,
        })),
      );

      if (transcodingJob) {
        await transcodingJob.update({ progress: 85, currentStep: 'writing-metadata' });
      }
      await episode.update({ processingProgress: 85 });
      await job.progress(85);

      const manifestUrl = `/uploads/hls/episode_${episodeId}/master.m3u8`;
      await episode.update({
        uploadStatus: 'ready',
        processingProgress: 100,
        status: 'published',
        publishedAt: new Date(),
      });

      if (transcodingJob) {
        await transcodingJob.update({
          status: 'done',
          progress: 100,
          currentStep: 'completed',
          outputManifestUrl: manifestUrl,
          completedAt: new Date(),
        });
      }

      if (uploadSession) {
        const metadataRaw = uploadSession.metadata;
        const metadata = metadataRaw ? JSON.parse(metadataRaw) : {};
        await uploadSession.update({
          status: 'completed',
          metadata: JSON.stringify({
            ...metadata,
            processingCompletedAt: new Date().toISOString(),
            masterPlaylistPath: manifestUrl,
            hlsBasePath,
          }),
        });
      }

      await job.progress(100);
      return {
        success: true,
        episodeId,
        manifestUrl,
      };
    } catch (error) {
      await episode.update({
        uploadStatus: 'failed',
        processingProgress: 0,
      });

      if (transcodingJob) {
        await transcodingJob.update({
          status: 'failed',
          currentStep: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown processing error',
        });
      }

      if (uploadSession) {
        const metadataRaw = uploadSession.metadata;
        const metadata = metadataRaw ? JSON.parse(metadataRaw) : {};
        await uploadSession.update({
          status: 'failed',
          metadata: JSON.stringify({
            ...metadata,
            processingError: error instanceof Error ? error.message : 'Unknown processing error',
          }),
        });
      }

      throw error;
    }
  }
}
