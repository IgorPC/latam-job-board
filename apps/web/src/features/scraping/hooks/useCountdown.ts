import { useEffect, useState } from 'react';

interface Countdown {
  label: string;
  isDue: boolean;
}

function format(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export function useCountdown(targetIso: string | undefined): Countdown {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!targetIso) return { label: '--:--:--', isDue: false };

  const diff = new Date(targetIso).getTime() - now;
  return { label: format(diff), isDue: diff <= 0 };
}
