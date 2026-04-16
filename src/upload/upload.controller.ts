import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { EnqueueProcessingDto } from './dto/enqueue-processing.dto';
import { InitializeUploadDto } from './dto/initialize-upload.dto';
import { UploadService } from './upload.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Post('initialize')
  async initializeUpload(@Body() dto: InitializeUploadDto) {
    const data = await this.uploadService.initializeUpload(dto);

    return {
      success: true,
      data,
      message: 'Upload session initialized',
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post(':sessionId/process')
  async enqueueProcessing(
    @Param('sessionId') sessionId: string,
    @Body() dto: EnqueueProcessingDto,
  ) {
    const data = await this.uploadService.enqueueProcessing(sessionId, dto);

    return {
      success: true,
      data,
      message: 'Video processing queued',
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get(':sessionId/progress')
  async getUploadProgress(@Param('sessionId') sessionId: string) {
    const data = await this.uploadService.getUploadProgress(sessionId);

    return {
      success: true,
      data,
      message: 'Upload progress fetched',
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('queue/stats')
  async getQueueStats() {
    const data = await this.uploadService.getQueueStats();

    return {
      success: true,
      data,
      message: 'Queue stats fetched',
    };
  }
}
