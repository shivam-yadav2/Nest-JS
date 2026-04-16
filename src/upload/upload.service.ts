import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { InjectModel } from '@nestjs/sequelize';
import type { Queue } from 'bull';
import { randomUUID } from 'node:crypto';
import { Episode } from '../series/entities/episode.entity';
import { TranscodingJob } from './entities/transcoding-job.entity';
import { UploadSession } from './entities/upload-session.entity';
import { EnqueueProcessingDto } from './dto/enqueue-processing.dto';
import { InitializeUploadDto } from './dto/initialize-upload.dto';
import {
  PROCESS_VIDEO_JOB,
  VIDEO_PROCESSING_QUEUE,
} from './queues/video-processing.constants';

type UploadMetadata = {
  episodeId?: number;
  fileName?: string;
  fileSize?: number;
  processingCompletedAt?: string;
  processingError?: string;
};

type InitializeUploadResult = {
  sessionId: string;
  totalChunks: number;
  chunkSize: number;
  fileName: string;
  fileSize: number;
  episodeId: number;
};

type EnqueueProcessingResult = {
  queueJobId: string | number;
  transcodingJobId: number;
  sessionId: string;
  episodeId: number;
  status: 'queued';
};

type UploadProgressResult = {
  sessionId: string;
  status: UploadSession['status'];
  uploadedChunks: number;
  totalChunks: number;
  fileName: string;
  fileSize: string | number;
  episode: {
    id: number;
    uploadStatus: Episode['uploadStatus'];
    processingProgress: number;
  } | null;
  transcoding: {
    id: number;
    status: TranscodingJob['status'];
    progress: number;
    currentStep: string | null;
    errorMessage: string | null;
    outputManifestUrl: string | null;
  } | null;
  metadata: UploadMetadata;
};

type QueueStatsResult = {
  queue: string;
  counts: Awaited<ReturnType<Queue['getJobCounts']>>;
};

@Injectable()
export class UploadService {
  constructor(
    @InjectQueue(VIDEO_PROCESSING_QUEUE) private readonly videoQueue: Queue,
    @InjectModel(UploadSession) private readonly uploadSessionModel: typeof UploadSession,
    @InjectModel(TranscodingJob) private readonly transcodingJobModel: typeof TranscodingJob,
    @InjectModel(Episode) private readonly episodeModel: typeof Episode,
    private readonly configService: ConfigService,
  ) {}

  async initializeUpload(dto: InitializeUploadDto): Promise<InitializeUploadResult> {
    const episode = await this.episodeModel.findByPk(dto.episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const chunkSize =
      this.configService.get<number>('video.chunkSize') ||
      Number(process.env.CHUNK_SIZE || 20 * 1024 * 1024);
    const totalChunks = dto.totalChunks || Math.ceil(dto.fileSize / chunkSize);

    const session = await this.uploadSessionModel.create({
      sessionId: `session_${Date.now()}_${randomUUID().slice(0, 8)}`,
      originalFilename: dto.fileName,
      totalSize: dto.fileSize,
      totalChunks,
      uploadedChunks: 0,
      status: 'active',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      metadata: JSON.stringify({
        episodeId: dto.episodeId,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
      } satisfies UploadMetadata),
    });

    await episode.update({
      uploadStatus: 'uploading',
      processingProgress: 0,
    });

    return {
      sessionId: session.sessionId,
      totalChunks,
      chunkSize,
      fileName: dto.fileName,
      fileSize: dto.fileSize,
      episodeId: dto.episodeId,
    };
  }

  async enqueueProcessing(
    sessionId: string,
    dto: EnqueueProcessingDto,
  ): Promise<EnqueueProcessingResult> {
    const session = await this.uploadSessionModel.findOne({
      where: { sessionId },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    const metadata = this.parseMetadata(session.metadata);
    const episodeId = metadata.episodeId;

    if (!episodeId) {
      throw new BadRequestException('Episode is not attached to this upload session');
    }

    const episode = await this.episodeModel.findByPk(episodeId);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    const jobRow = await this.transcodingJobModel.create({
      uploadSessionId: session.id,
      episodeId,
      status: 'queued',
      progress: 0,
      currentStep: 'queued',
      attempted: 0,
    });

    const job = await this.videoQueue.add(
      PROCESS_VIDEO_JOB,
      {
        sessionId,
        uploadSessionId: session.id,
        episodeId,
        fileName: metadata.fileName || session.originalFilename,
        inputPath: dto.inputPath,
        transcodingJobId: jobRow.id,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    await session.update({ status: 'processing' });
    await episode.update({
      uploadStatus: 'processing',
      processingProgress: 5,
    });

    return {
      queueJobId: job.id,
      transcodingJobId: Number(jobRow.id),
      sessionId,
      episodeId,
      status: 'queued',
    };
  }

  async getUploadProgress(sessionId: string): Promise<UploadProgressResult> {
    const session = await this.uploadSessionModel.findOne({ where: { sessionId } });
    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    const metadata = this.parseMetadata(session.metadata);
    const latestJob = await this.transcodingJobModel.findOne({
      where: { uploadSessionId: session.id },
      order: [['createdAt', 'DESC']],
    });

    const episode = metadata.episodeId
      ? await this.episodeModel.findByPk(metadata.episodeId)
      : null;

    return {
      sessionId: session.sessionId,
      status: session.status,
      uploadedChunks: session.uploadedChunks,
      totalChunks: session.totalChunks,
      fileName: session.originalFilename,
      fileSize: session.totalSize,
      episode: episode
        ? {
            id: episode.id,
            uploadStatus: episode.uploadStatus,
            processingProgress: episode.processingProgress,
          }
        : null,
      transcoding: latestJob
        ? {
            id: Number(latestJob.id),
            status: latestJob.status,
            progress: latestJob.progress,
            currentStep: latestJob.currentStep,
            errorMessage: latestJob.errorMessage,
            outputManifestUrl: latestJob.outputManifestUrl,
          }
        : null,
      metadata,
    };
  }

  async getQueueStats(): Promise<QueueStatsResult> {
    const counts = await this.videoQueue.getJobCounts();

    return {
      queue: VIDEO_PROCESSING_QUEUE,
      counts,
    };
  }

  private parseMetadata(raw: string | null): UploadMetadata {
    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as UploadMetadata;
      return parsed ?? {};
    } catch {
      return {};
    }
  }
}
