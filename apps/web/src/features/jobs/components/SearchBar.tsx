import { useEffect, useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (draft !== value) onChange(draft);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Search by title, company, or stack…"
        className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cta/60 focus:ring-2 focus:ring-cta/20"
      />
    </div>
  );
}
