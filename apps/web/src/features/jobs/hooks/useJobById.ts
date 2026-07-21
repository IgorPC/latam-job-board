import { useQuery } from '@tanstack/react-query';
import { fetchJobById } from '../services/jobs.service';

export function useJobById(id: number) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => fetchJobById(id),
    enabled: Number.isFinite(id),
  });
}
