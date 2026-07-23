import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyzeResume } from '../services/ai.service';
import { analysisHistoryQueryKey } from './useAnalysisHistory';

export function useAnalyzeResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, jobId }: { resumeId: number; jobId: number }) => analyzeResume(resumeId, jobId),
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: analysisHistoryQueryKey(analysis.jobId) });
    },
  });
}
