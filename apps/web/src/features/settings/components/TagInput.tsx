import { useState, type KeyboardEvent } from 'react';
import { cn } from '@/utils/cn';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  max: number;
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({ value, onChange, max, placeholder, disabled }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const tag = draft.trim().toLowerCase();
    if (!tag || value.includes(tag) || value.length >= max) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const atLimit = value.length >= max;

  return (
    <div>
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5',
          'focus-within:border-cta/60 focus-within:ring-2 focus-within:ring-cta/20 transition-shadow',
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-full bg-cta/10 px-3 py-1 text-sm font-medium text-cta-light"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-cta-light/70 hover:text-white"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!atLimit && !disabled && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={value.length === 0 ? placeholder : ''}
            className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
        )}
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        {value.length}/{max} · press Enter or comma to add
      </p>
    </div>
  );
}
