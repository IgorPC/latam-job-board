import { useScrapingStatus } from '../hooks/useScrapingStatus';
import { useCountdown } from '../hooks/useCountdown';

export function CountdownTimer() {
  const { data: status } = useScrapingStatus(true);
  const { label } = useCountdown(status?.nextRunAt);

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs text-slate-400">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cta opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cta" />
      </span>
      {status?.isRunning ? (
        <span className="text-cta-light">Scanning now…</span>
      ) : (
        <span>
          Next sync in <span className="font-mono text-slate-200">{label}</span>
        </span>
      )}
    </div>
  );
}
