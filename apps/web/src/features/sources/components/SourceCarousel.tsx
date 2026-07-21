import { isSafeUrl } from '@/utils/url';
import { SOURCES } from '../constants/sources';

function SourceBadge({ label, initials, gradient, url }: { label: string; initials: string; gradient: string; url: string }) {
  return (
    <a
      href={isSafeUrl(url) ? url : undefined}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${label}`}
      className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-surface/70 py-1.5 pl-1.5 pr-4 transition-colors hover:border-cta/40 hover:bg-surface"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-bold text-white shadow-sm`}
      >
        {initials}
      </span>
      <span className="whitespace-nowrap text-sm text-secondary">{label}</span>
    </a>
  );
}

export function SourceCarousel() {
  const track = [...SOURCES, ...SOURCES];

  return (
    <div className="relative overflow-hidden py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
        {track.map((source, i) => (
          <SourceBadge key={`${source.key}-${i}`} label={source.label} initials={source.initials} gradient={source.gradient} url={source.url} />
        ))}
      </div>
    </div>
  );
}
