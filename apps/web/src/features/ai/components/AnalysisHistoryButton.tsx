import { useState } from 'react';
import { ChevronDown, Clock } from '@untitledui/icons';
import { Modal } from '@/components/base/modal/modal';
import { Button } from '@/components/base/buttons/button';
import { cn } from '@/utils/cn';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { AnalysisResultView } from './AnalysisResultView';
import type { ResumeAnalysis } from '../types/ai.types';

function scoreChipClass(score: number): string {
  if (score >= 8) return 'bg-latam-yes/15 text-latam-yes';
  if (score >= 5) return 'bg-latam-maybe/15 text-latam-maybe';
  return 'bg-latam-no/15 text-latam-no';
}

function HistoryAccordionItem({ analysis, isOpen, onToggle }: { analysis: ResumeAnalysis; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 bg-background/40 px-4 py-3 text-left transition-colors hover:bg-background/60"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-primary">{analysis.resumeFilename}</p>
          <p className="text-xs text-tertiary">{new Date(analysis.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', scoreChipClass(analysis.score))}>
            {Number(analysis.score).toFixed(1)}/10
          </span>
          <ChevronDown className={cn('size-4 text-tertiary transition-transform', isOpen && 'rotate-180')} />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border p-4">
          <AnalysisResultView analysis={analysis} variant="compact" />
        </div>
      )}
    </div>
  );
}

export function AnalysisHistoryButton({ jobId }: { jobId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openAnalysisId, setOpenAnalysisId] = useState<number | null>(null);
  const { data: history = [], isLoading } = useAnalysisHistory(jobId, isOpen);

  return (
    <>
      <Button color="tertiary" size="sm" iconLeading={Clock} onClick={() => setIsOpen(true)}>
        Analysis history
      </Button>

      <Modal isOpen={isOpen} onOpenChange={setIsOpen} title="Analysis history" size="lg">
        {isLoading && <p className="text-sm text-tertiary">Loading…</p>}
        {!isLoading && history.length === 0 && <p className="text-sm text-tertiary">No analyses yet for this job.</p>}
        <div className="space-y-3">
          {history.map((analysis) => (
            <HistoryAccordionItem
              key={analysis.id}
              analysis={analysis}
              isOpen={openAnalysisId === analysis.id}
              onToggle={() => setOpenAnalysisId((prev) => (prev === analysis.id ? null : analysis.id))}
            />
          ))}
        </div>
      </Modal>
    </>
  );
}
