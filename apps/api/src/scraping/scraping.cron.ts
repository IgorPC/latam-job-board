import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ScrapingService } from './scraping.service';
import { CRON_SCHEDULE } from './consts/scraping.consts';

@Injectable()
export class ScrapingCron {
  private readonly logger = new Logger(ScrapingCron.name);

  constructor(private readonly scrapingService: ScrapingService) {}

  @Cron(CRON_SCHEDULE)
  async handleCron() {
    try {
      const result = await this.scrapingService.run({ initialRun: false });
      this.logger.log(`Cron run completed newJobs=${result.newJobs} sourcesRun=${result.sourcesRun}`);
    } catch (err) {
      this.logger.error('Cron run failed', err instanceof Error ? err.stack : String(err));
    }
  }
}
