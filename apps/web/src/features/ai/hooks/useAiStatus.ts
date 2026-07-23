import { useQuery } from '@tanstack/react-query';
import { fetchAiStatus } from '../services/ai.service';

export function useAiStatus() {
  return useQuery({
    queryKey: ['ai-status'],
    queryFn: fetchAiStatus,
    staleTime: 5 * 60_000,
  });
}
