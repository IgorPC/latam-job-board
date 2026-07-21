import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '@/config/socket';
import type { ScrapingCompletedEvent, ScrapingStatus, ScrapingStatusEvent } from '../types/scraping.types';

const STATUS_KEY = ['scraping-status'];

export function useScrapingSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onStatus = (payload: ScrapingStatusEvent) => {
      queryClient.setQueryData<ScrapingStatus | undefined>(STATUS_KEY, (current) =>
        current ? { ...current, isRunning: payload.isRunning } : current,
      );
    };

    const onCompleted = (_payload: ScrapingCompletedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: STATUS_KEY });
    };

    socket.on('scraping:status', onStatus);
    socket.on('scraping:completed', onCompleted);

    return () => {
      socket.off('scraping:status', onStatus);
      socket.off('scraping:completed', onCompleted);
    };
  }, [queryClient]);
}
