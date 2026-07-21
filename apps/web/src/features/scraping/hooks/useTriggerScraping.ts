import { useMutation, useQueryClient } from '@tanstack/react-query';
import { triggerScraping } from '../services/scraping.service';

export function useTriggerScraping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (initialRun: boolean) => triggerScraping(initialRun),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['scraping-status'] });
    },
  });
}
