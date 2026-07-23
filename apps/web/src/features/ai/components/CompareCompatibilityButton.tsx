import { useState } from 'react';
import { FileSearch02 } from '@untitledui/icons';
import { Modal } from '@/components/base/modal/modal';
import { Button } from '@/components/base/buttons/button';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { useAiStatus } from '../hooks/useAiStatus';
import { useResumes } from '../hooks/useResumes';
import { useAnalyzeResume } from '../hooks/useAnalyzeResume';
import { getApiErrorMessage } from '../utils/errors';
import { AnalysisResultView } from './AnalysisResultView';

type Step = 'pick' | 'result';

export function CompareCompatibilityButton({ jobId }: { jobId: number }) {
  const { data: status } = useAiStatus();
  const aiEnabled = status?.aiEnabled ?? false;

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('pick');
  const { data: resumes = [] } = useResumes(isOpen);
  const analyze = useAnalyzeResume();

  const openModal = () => {
    setStep('pick');
    analyze.reset();
    setIsOpen(true);
  };

  const handlePick = (resumeId: number) => {
    analyze.mutate(
      { resumeId, jobId },
      {
        onSuccess: () => setStep('result'),
      },
    );
  };

  const disabledReason = !aiEnabled
    ? 'The server is missing the DEEPSEEK_API_KEY environment variable.'
    : resumes.length === 0
      ? 'Upload a resume first from the Resumes button in the header.'
      : null;

  const button = (
    <Button color="secondary" size="sm" iconLeading={FileSearch02} isDisabled={!aiEnabled} onClick={aiEnabled ? openModal : undefined}>
      Compare compatibility
    </Button>
  );

  return (
    <>
      {aiEnabled ? button : <Tooltip title="AI analysis is disabled" description={disabledReason ?? undefined}>{button}</Tooltip>}

      <Modal isOpen={isOpen} onOpenChange={setIsOpen} title={step === 'pick' ? 'Choose a resume' : 'Compatibility analysis'} size="md">
        {step === 'pick' && (
          <div className="space-y-3">
            {resumes.length === 0 && (
              <p className="text-sm text-tertiary">
                {disabledReason ?? 'No resumes yet — upload one from the Resumes button in the header.'}
              </p>
            )}
            {resumes.map((resume) => (
              <button
                key={resume.id}
                type="button"
                disabled={analyze.isPending}
                onClick={() => handlePick(resume.id)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2.5 text-left text-sm text-primary transition-colors hover:border-cta/40 disabled:opacity-50"
              >
                {resume.filename}
                {analyze.isPending && analyze.variables?.resumeId === resume.id && (
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cta/30 border-t-cta" />
                )}
              </button>
            ))}
            {analyze.isPending && <p className="text-xs text-tertiary">Analyzing match against the job posting — this can take up to a minute…</p>}
            {analyze.isError && <p className="text-xs text-error-primary">{getApiErrorMessage(analyze.error)}</p>}
          </div>
        )}

        {step === 'result' && analyze.data && <AnalysisResultView analysis={analyze.data} />}
      </Modal>
    </>
  );
}
