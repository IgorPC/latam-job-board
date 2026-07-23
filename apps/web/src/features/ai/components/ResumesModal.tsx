import { useRef, useState } from 'react';
import { FileCheck02, Trash01, Upload01 } from '@untitledui/icons';
import { Modal } from '@/components/base/modal/modal';
import { Button } from '@/components/base/buttons/button';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useResumes } from '../hooks/useResumes';
import { useUploadResume } from '../hooks/useUploadResume';
import { useDeleteResume } from '../hooks/useDeleteResume';
import { getApiErrorMessage } from '../utils/errors';

const LOCKED_TOOLTIP = {
  title: 'Editing is disabled',
  description: 'This deployment has LOCK_EDIT enabled and is read-only.',
};

const MAX_RESUMES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ResumesModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ResumesModal({ isOpen, onOpenChange }: ResumesModalProps) {
  const { data: settings } = useSettings();
  const { data: resumes = [], isLoading } = useResumes(isOpen);
  const uploadResume = useUploadResume();
  const deleteResume = useDeleteResume();
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editLocked = settings?.editLocked ?? false;
  const canUpload = resumes.length < MAX_RESUMES && !editLocked;

  const handleFileSelected = (file: File | undefined) => {
    setLocalError(null);
    uploadResume.reset();
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setLocalError('Only PDF files are accepted.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setLocalError('Resume must be under 5MB.');
      return;
    }

    uploadResume.mutate(file, {
      onSettled: () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  const errorMessage = localError ?? (uploadResume.isError ? getApiErrorMessage(uploadResume.error) : null);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} title="Resumes" size="sm">
      <p className="text-sm text-tertiary">Upload up to {MAX_RESUMES} resumes (PDF, max 5MB each) to compare against job postings.</p>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-tertiary">Loading…</p>}
        {!isLoading && resumes.length === 0 && <p className="text-sm text-tertiary">No resumes uploaded yet.</p>}
        {resumes.map((resume) => (
          <div key={resume.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <FileCheck02 className="size-4 shrink-0 text-cta-light" />
              <div className="min-w-0">
                <p className="truncate text-sm text-primary">{resume.filename}</p>
                <p className="text-xs text-tertiary">{formatFileSize(resume.fileSizeBytes)}</p>
              </div>
            </div>
            {(() => {
              // Not the native `disabled` attribute when locked — that would
              // also block the pointer events the Tooltip needs to show on hover.
              const deleteBtn = (
                <button
                  type="button"
                  aria-label={`Delete ${resume.filename}`}
                  onClick={() => !editLocked && deleteResume.mutate(resume.id)}
                  aria-disabled={editLocked || deleteResume.isPending}
                  className={
                    editLocked
                      ? 'shrink-0 cursor-not-allowed rounded-md p-1.5 text-tertiary opacity-40'
                      : 'shrink-0 rounded-md p-1.5 text-tertiary transition-colors hover:bg-error-primary/10 hover:text-error-primary disabled:opacity-40'
                  }
                  disabled={!editLocked && deleteResume.isPending}
                >
                  <Trash01 className="size-4" />
                </button>
              );
              return editLocked ? (
                <Tooltip title={LOCKED_TOOLTIP.title} description={LOCKED_TOOLTIP.description}>
                  {deleteBtn}
                </Tooltip>
              ) : (
                deleteBtn
              );
            })()}
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileSelected(e.target.files?.[0])} />
        {editLocked ? (
          <Tooltip title={LOCKED_TOOLTIP.title} description={LOCKED_TOOLTIP.description}>
            <Button color="secondary" size="sm" iconLeading={Upload01} isDisabled>
              Upload resume
            </Button>
          </Tooltip>
        ) : (
          <Button
            color="secondary"
            size="sm"
            iconLeading={Upload01}
            isDisabled={!canUpload || uploadResume.isPending}
            isLoading={uploadResume.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {canUpload ? 'Upload resume' : `Limit of ${MAX_RESUMES} reached`}
          </Button>
        )}
        {errorMessage && <p className="mt-2 text-xs text-error-primary">{errorMessage}</p>}
      </div>
    </Modal>
  );
}
