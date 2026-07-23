import { Link } from 'react-router-dom';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { useSettings } from '../hooks/useSettings';

const BASE_CLASS = 'rounded-lg bg-gradient-to-r from-cta to-accent px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs';

export function ReconfigureButton() {
  const { data: settings } = useSettings();

  if (settings?.editLocked) {
    return (
      <Tooltip title="Reconfiguring is disabled" description="This deployment has LOCK_EDIT enabled and is read-only.">
        {/* Not a Link when locked: clicking must not navigate to /setup at all. */}
        <span className={`${BASE_CLASS} cursor-not-allowed opacity-40`}>Reconfigure</span>
      </Tooltip>
    );
  }

  return (
    <Link to="/setup" className={`${BASE_CLASS} transition-transform hover:scale-105 hover:brightness-110`}>
      Reconfigure
    </Link>
  );
}
