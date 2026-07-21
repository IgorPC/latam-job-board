import { cn } from '@/utils/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-border px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40"
      >
        ← Prev
      </button>
      <span className="px-2 text-sm text-slate-400">
        Page <span className="text-slate-200">{page}</span> of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn('rounded-lg border border-border px-3 py-1.5 text-sm text-slate-300', page >= totalPages && 'opacity-40')}
      >
        Next →
      </button>
    </div>
  );
}
