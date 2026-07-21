import { useQuery } from '@tanstack/react-query';
import { fetchSettings } from '../services/settings.service';

export const SETTINGS_QUERY_KEY = ['settings'] as const;

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: fetchSettings,
  });
}
