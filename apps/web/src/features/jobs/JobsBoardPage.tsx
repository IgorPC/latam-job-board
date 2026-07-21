import { useSettings } from '@/features/settings/hooks/useSettings';
import { SourceCarousel } from '@/features/sources/components/SourceCarousel';
import { BooleanSearchLinks } from '@/features/search/components/BooleanSearchLinks';
import { ScanningBanner } from '@/features/scraping/components/ScanningBanner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { useJobs } from './hooks/useJobs';
import { useJobsFilters } from './hooks/useJobsFilters';
import { SearchBar } from './components/SearchBar';
import { Filters } from './components/Filters';
import { SourcesMultiSelect } from './components/SourcesMultiSelect';
import { JobList } from './components/JobList';
import { Pagination } from './components/Pagination';

export function JobsBoardPage() {
  const { data: settings } = useSettings();
  const { state, dispatch, query } = useJobsFilters();
  const { data, isLoading, isError, refetch } = useJobs(query);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-8 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-cta">
          {settings?.primaryStack?.join(' · ') || 'Your board'}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-100 sm:text-4xl">
          Remote &amp; relocation jobs, <span className="text-gradient">built for LATAM</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
          Aggregated daily from 19 sources, filtered by your stack and by whether they explicitly accept candidates
          from Latin America.
        </p>
      </section>

      <div className="mb-10">
        <SourceCarousel />
      </div>

      <ScanningBanner />

      <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={state.search} onChange={(value) => dispatch({ type: 'SET_SEARCH', value })} />
        <Filters
          since={state.since}
          type={state.type}
          latam={state.latam}
          onSinceChange={(value) => dispatch({ type: 'SET_SINCE', value })}
          onTypeChange={(value) => dispatch({ type: 'SET_TYPE', value })}
          onLatamChange={(value) => dispatch({ type: 'SET_LATAM', value })}
        />
        <SourcesMultiSelect selected={state.sources} onChange={(value) => dispatch({ type: 'SET_SOURCES', value })} />
      </section>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState message="Couldn't load jobs." onRetry={() => refetch()} />}

      {data && (
        <>
          <p className="mb-4 text-sm text-slate-500">{data.total} jobs found</p>
          <JobList jobs={data.items} />
          <div className="mt-8">
            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={(page) => dispatch({ type: 'SET_PAGE', value: page })} />
          </div>
        </>
      )}

      {settings && (
        <div className="mt-14">
          <BooleanSearchLinks primaryStack={settings.primaryStack} secondaryStack={settings.secondaryStack} />
        </div>
      )}
    </div>
  );
}
