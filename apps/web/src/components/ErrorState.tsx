interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface py-16 text-center">
      <p className="text-slate-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-medium text-cta hover:text-cta-light">
          Try again
        </button>
      )}
    </div>
  );
}
