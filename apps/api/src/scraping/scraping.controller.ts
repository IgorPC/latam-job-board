import { Controller, Get, HttpException, InternalServerErrorException, Logger, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ScrapingService } from './scraping.service';
import { RunScrapingDto } from './dto/run-scraping.dto';
import { SCRAPING_CONTROLLER_PATH, SCRAPING_ROUTES } from './consts/endpoints';

@Controller(SCRAPING_CONTROLLER_PATH)
export class ScrapingController {
  private readonly logger = new Logger(ScrapingController.name);

  constructor(private readonly scraping: ScrapingService) {}

  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post(SCRAPING_ROUTES.RUN)
  async run(@Query() dto: RunScrapingDto) {
    try {
      return await this.scraping.run({ initialRun: dto.initialRun });
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error('run failed', err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }

  @Get(SCRAPING_ROUTES.STATUS)
  async status() {
    try {
      return await this.scraping.status();
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error('status failed', err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException();
    }
  }
}
