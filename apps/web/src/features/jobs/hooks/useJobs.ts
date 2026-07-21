import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchJobs } from '../services/jobs.service';
import type { JobsQuery } from '../types/job.types';

export function useJobs(query: JobsQuery) {
  return useQuery({
    queryKey: ['jobs', query],
    queryFn: () => fetchJobs(query),
    placeholderData: keepPreviousData,
  });
}
