import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveSettings } from '../services/settings.service';
import { SETTINGS_QUERY_KEY } from './useSettings';

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, settings);
    },
  });
}
