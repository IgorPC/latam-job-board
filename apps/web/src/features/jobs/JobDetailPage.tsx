import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ArrowLeft, Globe01, LinkExternal01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { isSafeUrl } from '@/utils/url';
import { useJobById } from './hooks/useJobById';
import { LatamBadge } from './components/LatamBadge';
import { CompareCompatibilityButton } from '@/features/ai/components/CompareCompatibilityButton';
import { AnalysisHistoryButton } from '@/features/ai/components/AnalysisHistoryButton';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = Number(id);
  const { data: job, isLoading, isError, refetch } = useJobById(jobId);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !job) return <ErrorState message="Couldn't load this job." onRetry={() => refetch()} />;

  const stacks = job.stack && job.stack !== 'N/A' ? job.stack.split(',').map((s) => s.trim()) : [];
  const href = isSafeUrl(job.url) ? job.url : undefined;
  const isRelocation = job.type.toLowerCase().includes('relocation');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Button color="tertiary" size="sm" iconLeading={ArrowLeft} onClick={() => navigate(-1)} className="mb-6">
        Back to listing
      </Button>

      <article className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-primary">{job.title}</h1>
            <p className="mt-1 text-secondary">{job.company || 'Unlisted company'}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isRelocation && (
              <span title="Relocation position" className="flex h-8 w-8 items-center justify-center rounded-full bg-dusk-blue/30 text-dusty-denim">
                <Globe01 className="size-4" />
              </span>
            )}
            <LatamBadge value={job.acceptsLatam} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-tertiary">
          <span>{job.source}</span>
          <span>·</span>
          <span>{job.type}</span>
          {job.salary && (
            <>
              <span>·</span>
              <span className="text-secondary">{job.salary}</span>
            </>
          )}
          {job.publishedAt && (
            <>
              <span>·</span>
              <span>Published {job.publishedAt}</span>
            </>
          )}
        </div>

        {stacks.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {stacks.map((s) => (
              <span key={s} className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-secondary">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-border pt-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-tertiary">Description</h2>
          {job.description ? (
            // Scraped, third-party HTML — never trusted as-is. Sanitized here
            // so the original posting's formatting (paragraphs, lists, bold)
            // renders instead of showing raw tags as plain text.
            <div
              className="job-description mt-3 text-sm leading-relaxed text-secondary"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
            />
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-secondary">No description was captured for this posting.</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
          <CompareCompatibilityButton jobId={job.id} />
          <AnalysisHistoryButton jobId={job.id} />
        </div>

        <div className="mt-8">
          {href ? (
            <Button color="primary" iconTrailing={LinkExternal01} href={href} target="_blank" rel="noopener noreferrer">
              View original posting
            </Button>
          ) : (
            <Button color="primary" isDisabled>
              Original posting unavailable
            </Button>
          )}
        </div>
      </article>
    </div>
  );
}
