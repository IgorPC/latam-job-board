import { cn } from '@/utils/cn';
import type { JobType } from '../types/settings.types';

const OPTIONS: Array<{ value: JobType; label: string; description: string; icon: string }> = [
  { value: 'remote', label: 'Remote', description: 'Fully remote positions, anywhere in the world', icon: '🌎' },
  { value: 'relocation', label: 'Relocation', description: 'Roles that sponsor visa/relocation', icon: '✈️' },
  { value: 'both', label: 'Both', description: "Don't filter — show everything", icon: '🔀' },
];

interface JobTypeSelectorProps {
  value: JobType | undefined;
  onChange: (value: JobType) => void;
}

export function JobTypeSelector({ value, onChange }: JobTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-xl border p-4 text-left transition-all',
            value === option.value
              ? 'border-cta/60 bg-cta/10 ring-2 ring-cta/20'
              : 'border-border bg-surface hover:border-slate-600',
          )}
        >
          <span className="text-2xl">{option.icon}</span>
          <p className="mt-2 font-display font-semibold text-slate-100">{option.label}</p>
          <p className="mt-1 text-xs text-slate-400">{option.description}</p>
        </button>
      ))}
    </div>
  );
}
