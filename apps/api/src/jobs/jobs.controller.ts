import { Controller, Get, HttpException, InternalServerErrorException, Logger, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JobsService } from './jobs.service';
import { FilterJobsDto } from './dto/filter-jobs.dto';
import { JOBS_CONTROLLER_PATH, JOBS_ROUTES } from './consts/endpoints';

@Controller(JOBS_CONTROLLER_PATH)
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private readonly jobs: JobsService) {}

  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Get(JOBS_ROUTES.LIST)
  async list(@Query() dto: FilterJobsDto) {
    try {
      return await this.jobs.list(dto);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`list failed query=${JSON.stringify(dto)}`, err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }
}
