export interface ScrapingStatus {
  lastSyncAt: string | null;
  nextRunAt: string;
  setupCompleted: boolean;
  isRunning: boolean;
}

export interface TriggerRunResult {
  started: boolean;
}

export interface ScrapingCompletedEvent {
  newJobs: number;
  sourcesRun: number;
}

export interface ScrapingStatusEvent {
  isRunning: boolean;
}
