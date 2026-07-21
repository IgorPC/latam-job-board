import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@untitledui/icons';
import { SetupWizard } from './components/SetupWizard';
import { useSettings } from './hooks/useSettings';

export function SetupPage() {
  const navigate = useNavigate();
  const { data: settings } = useSettings();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
      {settings?.setupCompleted && (
        <Link
          to="/"
          className="mb-6 flex items-center gap-1.5 self-start text-sm font-medium text-tertiary transition-colors hover:text-primary sm:absolute sm:left-6 sm:top-6 sm:mb-0"
        >
          <ArrowLeft className="size-4" />
          Back to board
        </Link>
      )}

      <div className="mb-10 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-cta">LATAM Job Board</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-primary sm:text-4xl">
          Let's tune the board to <span className="text-gradient">your stack</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-tertiary">
          One-time setup. We'll scan 19 sources daily and keep only jobs that match your profile and accept LATAM
          candidates.
        </p>
      </div>
      <SetupWizard onComplete={() => navigate('/', { replace: true })} />
    </div>
  );
}
