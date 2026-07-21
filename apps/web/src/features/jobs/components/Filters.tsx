import { Select } from '@/components/base/select/select';
import type { JobLatamFilter, JobSince, JobTypeFilter } from '../types/job.types';

interface FiltersProps {
  since: JobSince;
  type: JobTypeFilter | 'all';
  latam: JobLatamFilter | 'all';
  onSinceChange: (value: JobSince) => void;
  onTypeChange: (value: JobTypeFilter | 'all') => void;
  onLatamChange: (value: JobLatamFilter | 'all') => void;
}

const SINCE_OPTIONS = [
  { id: 'all', label: 'Any time' },
  { id: '24h', label: 'Last 24h' },
  { id: '3d', label: 'Last 3 days' },
  { id: '7d', label: 'Last week' },
];

const TYPE_OPTIONS = [
  { id: 'all', label: 'Remote or relocation' },
  { id: 'remote', label: 'Remote' },
  { id: 'relocation', label: 'Relocation' },
];

const LATAM_OPTIONS = [
  { id: 'all', label: 'Any' },
  { id: 'yes', label: 'Accepts LATAM' },
  { id: 'maybe', label: 'Unclear' },
  { id: 'no', label: 'Restricted' },
];

export function Filters({ since, type, latam, onSinceChange, onTypeChange, onLatamChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        aria-label="Since"
        items={SINCE_OPTIONS}
        selectedKey={since}
        onSelectionChange={(key) => onSinceChange(key as JobSince)}
        size="sm"
        className="w-44"
      >
        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
      </Select>

      <Select
        aria-label="Type"
        items={TYPE_OPTIONS}
        selectedKey={type}
        onSelectionChange={(key) => onTypeChange(key as JobTypeFilter | 'all')}
        size="sm"
        className="w-52"
      >
        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
      </Select>

      <Select
        aria-label="LATAM"
        items={LATAM_OPTIONS}
        selectedKey={latam}
        onSelectionChange={(key) => onLatamChange(key as JobLatamFilter | 'all')}
        size="sm"
        className="w-40"
      >
        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
      </Select>
    </div>
  );
}
