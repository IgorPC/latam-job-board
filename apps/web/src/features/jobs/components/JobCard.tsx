import { useNavigate } from 'react-router-dom';
import { Globe01 } from '@untitledui/icons';
import { isSafeUrl } from '@/utils/url';
import type { Job } from '../types/job.types';
import { LatamBadge } from './LatamBadge';

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function JobCard({ job }: { job: Job }) {
  const navigate = useNavigate();
  const stacks = job.stack && job.stack !== 'N/A' ? job.stack.split(',').map((s) => s.trim()) : [];
  const href = isSafeUrl(job.url) ? job.url : undefined;
  const isRelocation = job.type.toLowerCase().includes('relocation');

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/jobs/${job.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/jobs/${job.id}`);
      }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all hover:border-cta/40 hover:shadow-[0_0_30px_-10px_rgba(65,90,119,0.45)]"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cta/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display font-semibold text-primary">{job.title}</h3>
          <p className="mt-0.5 truncate text-sm text-tertiary">{job.company || 'Unlisted company'}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isRelocation && (
            <span
              title="Relocation position"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-dusk-blue/30 text-dusty-denim"
            >
              <Globe01 className="size-3.5" />
            </span>
          )}
          <LatamBadge value={job.acceptsLatam} />
        </div>
      </div>

      {stacks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {stacks.slice(0, 6).map((s) => (
            <span key={s} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-secondary">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-tertiary">
        <span>{job.source}</span>
        <span>·</span>
        <span>{job.type}</span>
        {job.salary && (
          <>
            <span>·</span>
            <span className="text-secondary">{job.salary}</span>
          </>
        )}
        <span>·</span>
        <span>{timeAgo(job.publishedAt)}</span>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mt-4 inline-flex items-center gap-1 text-sm font-medium text-cta hover:text-cta-light"
      >
        View posting <span aria-hidden>→</span>
      </a>
    </article>
  );
}
