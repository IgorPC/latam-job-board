import { useQuery } from '@tanstack/react-query';
import { fetchScrapingStatus } from '../services/scraping.service';

export function useScrapingStatus(enabled: boolean) {
  return useQuery({
    queryKey: ['scraping-status'],
    queryFn: fetchScrapingStatus,
    enabled,
    refetchInterval: 60_000,
  });
}
