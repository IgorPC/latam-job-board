export interface ScrapingStatusDto {
  lastSyncAt: Date | null;
  nextRunAt: string;
  setupCompleted: boolean;
}
