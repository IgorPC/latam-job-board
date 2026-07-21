import type { Job } from '../types/job.types';
import { JobCard } from './JobCard';

export function JobList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center text-slate-400">
        No jobs match these filters yet. Try widening the time range or clearing a filter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
