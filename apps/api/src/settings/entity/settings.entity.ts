import { Entity, PrimaryColumn, Column } from 'typeorm';

export enum SettingsJobType {
  REMOTE = 'remote',
  RELOCATION = 'relocation',
  BOTH = 'both',
}

export const DEFAULT_LATAM_COUNTRY = 'Brazil';

export const DEFAULT_ENABLED_SOURCES = [
  'remoteok',
  'arbeitnow',
  'weworkremotely',
  'workingnomads',
  'jobgether',
  'relocateme',
  'dynamitejobs',
  'dice',
  'visajobs',
  'relocation-companies',
  'himalayas',
  'jobicy',
  'strider',
  'fitnext',
];

@Entity('settings')
export class Settings {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ name: 'primary_stack', type: 'json' })
  primaryStack: string[];

  @Column({ name: 'secondary_stack', type: 'json', nullable: true })
  secondaryStack: string[];

  @Column({ name: 'job_type', type: 'enum', enum: SettingsJobType })
  jobType: SettingsJobType;

  // English name of the LATAM country to match against scraped job text
  // (e.g. "Brazil", "Argentina") — drives the dynamic keyword in
  // scraping/utils/filters.ts's acceptsLatam(), so the board isn't hardcoded
  // to Brazil for users elsewhere in Latin America.
  @Column({ name: 'latam_country', length: 60, default: DEFAULT_LATAM_COUNTRY })
  latamCountry: string;

  @Column({ name: 'enabled_sources', type: 'json', nullable: true })
  enabledSources: string[];

  @Column({ name: 'setup_completed', default: false })
  setupCompleted: boolean;

  @Column({ name: 'last_sync_at', type: 'datetime', nullable: true })
  lastSyncAt: Date | null;

  // Durable guard against concurrent scraping runs (manual trigger vs. cron)
  // and the source of truth for "is a scan in progress" across page reloads —
  // the in-memory flag in ScrapingService alone wouldn't survive an API restart.
  @Column({ name: 'is_scraping_running', default: false })
  isScrapingRunning: boolean;
}
