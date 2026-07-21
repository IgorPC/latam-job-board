import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { SettingsRepository } from '../settings/settings.repository';
import { ScrapingRepository } from './scraping.repository';
import { ScrapingGateway } from './scraping.gateway';
import { ScrapingProfile, ScrapingSource } from './interfaces/scraping-context.interface';
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

  // Fast in-memory guard checked before the DB round-trip — the persisted
  // `is_scraping_running` column is the durable source of truth (survives a
  // restart/reload), this just avoids a race between two near-simultaneous
  // requests both reading the DB flag as false before either sets it.
  private isRunningGuard = false;

  constructor(
    private readonly settingsRepo: SettingsRepository,
    private readonly scrapingRepo: ScrapingRepository,
    private readonly gateway: ScrapingGateway,
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

  // Fire-and-forget entry point for the HTTP endpoint — a full run can take
  // several minutes (every source, in series), far longer than any sane HTTP
  // client timeout, so the request must not block on it. Starts the run in
  // the background and returns as soon as it's safely marked "in progress".
  async triggerRun(options: RunOptions = {}): Promise<{ started: boolean }> {
    await this.assertConfigured();
    await this.beginRun();

    this.executeRun(options)
      .catch((err) => {
        this.logger.error(`background run failed: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => this.endRun());

    return { started: true };
  }

  // Awaited entry point for the cron job — nothing is waiting on an HTTP
  // response here, so it can run to completion and log the final numbers.
  async runNow(options: RunOptions = {}): Promise<{ newJobs: number; sourcesRun: number }> {
    await this.assertConfigured();
    await this.beginRun();
    try {
      return await this.executeRun(options);
    } finally {
      await this.endRun();
    }
  }

  private async assertConfigured(): Promise<void> {
    const settings = await this.settingsRepo.findCurrent();
    if (!settings) {
      throw new BadRequestException('Configure your preferences before running the scraper (POST /settings).');
    }
  }

  private async beginRun(): Promise<void> {
    if (this.isRunningGuard) {
      throw new ConflictException('A scraping run is already in progress.');
    }
    this.isRunningGuard = true;
    await this.settingsRepo.settings.update({ id: 1 }, { isScrapingRunning: true });
    this.gateway.broadcastStatus({ isRunning: true });
  }

  private async endRun(): Promise<void> {
    this.isRunningGuard = false;
    await this.settingsRepo.settings.update({ id: 1 }, { isScrapingRunning: false });
    this.gateway.broadcastStatus({ isRunning: false });
  }

  private async executeRun(options: RunOptions): Promise<{ newJobs: number; sourcesRun: number }> {
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
      country: settings.latamCountry,
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

    const result = { newJobs, sourcesRun: sources.length };
    this.gateway.broadcastCompleted(result);
    return result;
  }

  private processRawJob(job: RawJob, profile: ScrapingProfile, maxAgeDays: number): ProcessedJob | null {
    const { _desc, ...rest } = job;

    if (!isRelevant(job.title, _desc, profile)) return null;
    if (!isRecent(job.date, maxAgeDays)) return null;

    const type = job.type || detectType(job.title, _desc, false, profile.country);
    const stack = job.stack || detectStack(job.title, _desc);
    const salary = job.salary || extractSalary(_desc);
    const description = _desc.replace(/\s+/g, ' ').trim().slice(0, 8000);

    return {
      ...rest,
      type,
      stack,
      salary,
      description,
      acceptsLatam: acceptsLatam(job.title, _desc, type, profile.country),
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
      isRunning: settings?.isScrapingRunning ?? false,
    };
  }
}
