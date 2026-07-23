import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadResume } from '../services/ai.service';
import { RESUMES_QUERY_KEY } from './useResumes';

export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
    },
  });
}
