import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError } from 'multer';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { AiEnabledGuard } from './guards/ai-enabled.guard';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';
import { AI_CONTROLLER_PATH, AI_ROUTES, MAX_RESUME_FILE_BYTES } from './consts/endpoints';
import { LockEditGuard } from '../common/guards/lock-edit.guard';

@Controller(AI_CONTROLLER_PATH)
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly ai: AiService) {}

  // Always reachable, unguarded — the frontend needs this to decide whether
  // to show the AI features at all, and why they're disabled if not.
  @Get(AI_ROUTES.STATUS)
  status() {
    return { aiEnabled: !!process.env.DEEPSEEK_API_KEY };
  }

  @UseGuards(AiEnabledGuard, LockEditGuard)
  @Post(AI_ROUTES.UPLOAD_RESUME)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_RESUME_FILE_BYTES } }))
  async uploadResume(@UploadedFile() file?: Express.Multer.File) {
    try {
      return await this.ai.uploadResume(file);
    } catch (err) {
      if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
        throw new BadRequestException('Resume must be under 5MB.');
      }
      if (err instanceof HttpException) throw err;
      this.logger.error('uploadResume failed', err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(AiEnabledGuard)
  @Get(AI_ROUTES.LIST_RESUMES)
  async listResumes() {
    try {
      return await this.ai.listResumes();
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error('listResumes failed', err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(AiEnabledGuard, LockEditGuard)
  @Delete(AI_ROUTES.DELETE_RESUME)
  async deleteResume(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.ai.deleteResume(id);
      return { deleted: true };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`deleteResume failed id=${id}`, err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }

  // The DeepSeek round-trip takes several seconds — a lower throttle limit
  // than the read routes is enough to prevent accidental hammering.
  @UseGuards(AiEnabledGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post(AI_ROUTES.ANALYZE)
  async analyze(@Body() dto: AnalyzeResumeDto) {
    try {
      return await this.ai.analyze(dto);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`analyze failed dto=${JSON.stringify(dto)}`, err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(AiEnabledGuard)
  @Get(AI_ROUTES.ANALYSIS_HISTORY)
  async history(@Param('jobId', ParseIntPipe) jobId: number) {
    try {
      return await this.ai.getHistory(jobId);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`history failed jobId=${jobId}`, err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }
}
