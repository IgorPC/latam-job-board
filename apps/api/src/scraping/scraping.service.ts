import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SettingsRepository } from '../settings/settings.repository';
import { ScrapingRepository } from './scraping.repository';
import { ScrapingSource } from './interfaces/scraping-context.interface';
import { ProcessedJob, RawJob } from './interfaces/raw-job.interface';
import { isRelevant, isRecent, acceptsLatam } from './utils/filters';
import { detectStack, detectType, extractSalary } from './utils/detectors';
import { MAX_AGE_DAYS_CRON, MAX_AGE_DAYS_INITIAL_RUN, NICHE_SOURCE_RULES } from './consts/scraping.consts';
import { ScrapingStatusDto } from './dto/scraping-status.dto';

import { remoteOkSource } from './sources/remoteok.source';
import { arbeitnowSource } from './sources/arbeitnow.source';
import { weWorkRemotelySource } from './sources/weworkremotely.source';
import { workingNomadsSource } from './sources/workingnomads.source';
import { jobgetherSource } from './sources/jobgether.source';
import { relocateMeSource } from './sources/relocateme.source';
import { dynamiteJobsSource } from './sources/dynamitejobs.source';
import { diceSource } from './sources/dice.source';
import { visaJobsSource } from './sources/visajobs.source';
import { laravelRemotelySource } from './sources/laravelremotely.source';
import { laraJobsSource } from './sources/larajobs.source';
import { relocationCompaniesSource } from './sources/relocation-companies.source';
import { himalayasSource } from './sources/himalayas.source';
import { jobicySource } from './sources/jobicy.source';
import { jsRemotelySource } from './sources/jsremotely.source';
import { cryptoJobsListSource } from './sources/cryptojobslist.source';
import { striderSource } from './sources/strider.source';
import { fitnextSource } from './sources/fitnext.source';
import { remoteTechCompaniesSource } from './sources/remote-tech-companies.source';

const ALL_SOURCES: ScrapingSource[] = [
  remoteOkSource,
  arbeitnowSource,
  weWorkRemotelySource,
  workingNomadsSource,
  jobgetherSource,
  relocateMeSource,
  dynamiteJobsSource,
  diceSource,
  visaJobsSource,
  laravelRemotelySource,
  laraJobsSource,
  relocationCompaniesSource,
  himalayasSource,
  jobicySource,
  jsRemotelySource,
  cryptoJobsListSource,
  striderSource,
  fitnextSource,
  remoteTechCompaniesSource,
];

interface RunOptions {
  initialRun?: boolean;
}

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    private readonly settingsRepo: SettingsRepository,
    private readonly scrapingRepo: ScrapingRepository,
  ) {}

  private resolveEnabledSources(primaryStack: string[], secondaryStack: string[], base: string[]): string[] {
    const allStack = [...primaryStack, ...secondaryStack].map((s) => s.toLowerCase());
    const sources = new Set(base);

    for (const rule of NICHE_SOURCE_RULES) {
      if (rule.keywords.some((kw) => allStack.some((s) => s.includes(kw)))) {
        sources.add(rule.source);
      }
    }

    return [...sources];
  }

  async run(options: RunOptions = {}): Promise<{ newJobs: number; sourcesRun: number }> {
    const settings = await this.settingsRepo.findCurrent();
    if (!settings) {
      throw new BadRequestException('Configure your preferences before running the scraper (POST /settings).');
    }

    const maxAgeDays = options.initialRun ? MAX_AGE_DAYS_INITIAL_RUN : MAX_AGE_DAYS_CRON;
    const enabledKeys = this.resolveEnabledSources(settings.primaryStack, settings.secondaryStack, settings.enabledSources);
    const sources = ALL_SOURCES.filter((s) => enabledKeys.includes(s.key));

    this.logger.log(`run started initialRun=${!!options.initialRun} maxAgeDays=${maxAgeDays} sources=${sources.length}`);

    const profile = {
      primaryStack: settings.primaryStack,
      secondaryStack: settings.secondaryStack,
      jobType: settings.jobType,
    };

    const processed: ProcessedJob[] = [];

    for (const source of sources) {
      try {
        const rawJobs = await source.run({ profile, maxAgeDays });
        this.logger.debug(`source=${source.key} returned ${rawJobs.length} raw jobs`);
        for (const job of rawJobs) {
          const shaped = this.processRawJob(job, profile, maxAgeDays);
          if (shaped) processed.push(shaped);
        }
      } catch (err) {
        this.logger.warn(`source=${source.key} failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const newJobs = await this.scrapingRepo.saveJobs(processed);

    await this.settingsRepo.settings.update({ id: 1 }, { lastSyncAt: new Date() });
    this.logger.log(`run finished sources=${sources.length} processed=${processed.length} newJobs=${newJobs}`);

    return { newJobs, sourcesRun: sources.length };
  }

  private processRawJob(
    job: RawJob,
    profile: { primaryStack: string[]; secondaryStack: string[]; jobType: string },
    maxAgeDays: number,
  ): ProcessedJob | null {
    const { _desc, ...rest } = job;

    if (!isRelevant(job.title, _desc, profile)) return null;
    if (!isRecent(job.date, maxAgeDays)) return null;

    const type = job.type || detectType(job.title, _desc);
    const stack = job.stack || detectStack(job.title, _desc);
    const salary = job.salary || extractSalary(_desc);

    return {
      ...rest,
      type,
      stack,
      salary,
      acceptsLatam: acceptsLatam(job.title, _desc, type),
    };
  }

  async status(): Promise<ScrapingStatusDto> {
    const settings = await this.settingsRepo.findCurrent();
    const lastSyncAt = settings?.lastSyncAt ?? null;

    const next = new Date();
    next.setHours(9, 0, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);

    return {
      lastSyncAt,
      nextRunAt: next.toISOString(),
      setupCompleted: settings?.setupCompleted ?? false,
    };
  }
}
