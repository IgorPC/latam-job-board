import { RawJob } from './raw-job.interface';

export interface ScrapingProfile {
  primaryStack: string[];
  secondaryStack: string[];
  jobType: string;
}

export interface ScrapingContext {
  profile: ScrapingProfile;
  maxAgeDays: number;
}

export interface ScrapingSource {
  key: string;
  label: string;
  run(ctx: ScrapingContext): Promise<RawJob[]>;
}
