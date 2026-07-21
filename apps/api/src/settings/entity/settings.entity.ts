import { Entity, PrimaryColumn, Column } from 'typeorm';

export enum SettingsJobType {
  REMOTE = 'remote',
  RELOCATION = 'relocation',
  BOTH = 'both',
}

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

  @Column({ name: 'enabled_sources', type: 'json', nullable: true })
  enabledSources: string[];

  @Column({ name: 'setup_completed', default: false })
  setupCompleted: boolean;

  @Column({ name: 'last_sync_at', type: 'datetime', nullable: true })
  lastSyncAt: Date | null;
}
