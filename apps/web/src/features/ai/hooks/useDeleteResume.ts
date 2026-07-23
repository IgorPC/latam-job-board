import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteResume } from '../services/ai.service';
import { RESUMES_QUERY_KEY } from './useResumes';

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
    },
  });
}
