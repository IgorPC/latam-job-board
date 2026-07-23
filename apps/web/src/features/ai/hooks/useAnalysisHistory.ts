import { useQuery } from '@tanstack/react-query';
import { fetchAnalysisHistory } from '../services/ai.service';

export function analysisHistoryQueryKey(jobId: number) {
  return ['ai-analysis-history', jobId] as const;
}

export function useAnalysisHistory(jobId: number, enabled: boolean) {
  return useQuery({
    queryKey: analysisHistoryQueryKey(jobId),
    queryFn: () => fetchAnalysisHistory(jobId),
    enabled: enabled && Number.isFinite(jobId),
  });
}
