import { useQuery } from '@tanstack/react-query';
import { fetchSourceCounts } from '../services/jobs.service';

export function useSourceCounts() {
  return useQuery({
    queryKey: ['jobs', 'source-counts'],
    queryFn: fetchSourceCounts,
  });
}
