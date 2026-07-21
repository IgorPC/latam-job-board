import { Controller, Get, HttpException, InternalServerErrorException, Logger, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JobsService } from './jobs.service';
import { FilterJobsDto } from './dto/filter-jobs.dto';
import { JOBS_CONTROLLER_PATH, JOBS_ROUTES } from './consts/endpoints';

@Controller(JOBS_CONTROLLER_PATH)
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private readonly jobs: JobsService) {}

  // Public, read-only, higher risk of scraping/abuse — stricter throttle than default.
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

  // Registered before ':id' — otherwise Nest would try to match
  // "source-counts" as the :id param.
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Get(JOBS_ROUTES.SOURCE_COUNTS)
  async sourceCounts() {
    try {
      return await this.jobs.sourceCounts();
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error('sourceCounts failed', err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }

  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Get(JOBS_ROUTES.DETAIL)
  async getById(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.jobs.getById(id);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`getById failed id=${id}`, err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }
}
