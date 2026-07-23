import { useState } from 'react';
import { File02 } from '@untitledui/icons';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { useAiStatus } from '../hooks/useAiStatus';
import { ResumesModal } from './ResumesModal';

export function ResumesButton() {
  const { data: status } = useAiStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const aiEnabled = status?.aiEnabled ?? false;

  // Deliberately not using the native `disabled` attribute here: disabled
  // elements don't receive pointer events in most browsers, which would
  // silently kill the hover tooltip explaining *why* it's disabled. Instead
  // the disabled look is purely visual and the click handler is a no-op.
  const button = (
    <button
      type="button"
      aria-disabled={!aiEnabled}
      onClick={() => aiEnabled && setIsModalOpen(true)}
      className={
        aiEnabled
          ? 'flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:border-cta/40 hover:text-primary'
          : 'flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-secondary opacity-40'
      }
    >
      <File02 className="size-3.5" />
      Resumes
    </button>
  );

  return (
    <>
      {aiEnabled ? (
        button
      ) : (
        <Tooltip title="AI features are disabled" description="The server is missing the DEEPSEEK_API_KEY environment variable.">
          {button}
        </Tooltip>
      )}
      <ResumesModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
