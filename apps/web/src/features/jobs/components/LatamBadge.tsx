import { cn } from '@/utils/cn';
import type { Job } from '../types/job.types';

const STYLES: Record<Job['acceptsLatam'], string> = {
  Yes: 'bg-latam-yes/15 text-latam-yes border-latam-yes/30',
  No: 'bg-latam-no/15 text-latam-no border-latam-no/30',
  Maybe: 'bg-latam-maybe/15 text-latam-maybe border-latam-maybe/30',
};

const LABELS: Record<Job['acceptsLatam'], string> = {
  Yes: 'Accepts LATAM',
  No: 'LATAM restricted',
  Maybe: 'LATAM unclear',
};

export function LatamBadge({ value }: { value: Job['acceptsLatam'] }) {
  return (
    <span className={cn('rounded-full border px-2.5 py-1 text-xs font-medium', STYLES[value])}>{LABELS[value]}</span>
  );
}
