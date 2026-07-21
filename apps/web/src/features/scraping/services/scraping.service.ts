import { api } from '@/config/api';
import type { ScrapingStatus, TriggerRunResult } from '../types/scraping.types';

export async function fetchScrapingStatus(): Promise<ScrapingStatus> {
  const { data } = await api.get<ScrapingStatus>('/scraping/status');
  return data;
}

export async function triggerScraping(initialRun: boolean): Promise<TriggerRunResult> {
  const { data } = await api.post<TriggerRunResult>('/scraping/run', null, {
    params: initialRun ? { initialRun: true } : undefined,
  });
  return data;
}
