import { api } from '@/config/api';
import type { SaveSettingsPayload, Settings } from '../types/settings.types';

export async function fetchSettings(): Promise<Settings> {
  const { data } = await api.get<Settings>('/settings');
  return data;
}

export async function saveSettings(payload: SaveSettingsPayload): Promise<Settings> {
  const { data } = await api.post<Settings>('/settings', payload);
  return data;
}
