import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { MainLayout } from '@/layouts/MainLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';

// Every board route (the job list, a job's detail page, ...) goes through
// this gate — no matter how it's reached (direct link, refresh, back/forward
// navigation), an unconfigured board always redirects to /setup instead of
// rendering.
export function RequireSetup({ children }: PropsWithChildren) {
  const { data: settings, isLoading, isError, refetch } = useSettings();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <ErrorState message="Couldn't reach the API." onRetry={() => refetch()} />
      </div>
    );
  }

  if (!settings?.setupCompleted) {
    return <Navigate to="/setup" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}
