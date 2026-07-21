export type JobType = 'remote' | 'relocation' | 'both';

export interface Settings {
  id: number;
  primaryStack: string[];
  secondaryStack: string[];
  jobType: JobType | null;
  enabledSources: string[];
  latamCountry: string;
  setupCompleted: boolean;
  lastSyncAt: string | null;
}

export interface SaveSettingsPayload {
  primaryStack: string[];
  secondaryStack: string[];
  jobType: JobType;
  latamCountry: string;
}
