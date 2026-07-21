import { cn } from '@/utils/cn';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-cta/30 border-t-cta" />
    </div>
  );
}
