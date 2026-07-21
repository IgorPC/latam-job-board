import { useScrapingStatus } from '../hooks/useScrapingStatus';

export function ScanningBanner() {
  const { data: status } = useScrapingStatus(true);

  if (!status?.isRunning) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-cta/30 bg-cta/10 px-4 py-3 text-sm text-cta-light animate-fade-in-up">
      <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span>
        Scanning every source for jobs matching your stack — this can take a few minutes. The board updates
        automatically as soon as it's done.
      </span>
    </div>
  );
}
