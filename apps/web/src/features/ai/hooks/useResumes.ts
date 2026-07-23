import { useQuery } from '@tanstack/react-query';
import { fetchResumes } from '../services/ai.service';

export const RESUMES_QUERY_KEY = ['resumes'] as const;

export function useResumes(enabled: boolean) {
  return useQuery({
    queryKey: RESUMES_QUERY_KEY,
    queryFn: fetchResumes,
    enabled,
  });
}
