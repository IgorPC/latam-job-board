import type { ReactNode } from 'react';
import { Dialog, Heading, Modal as AriaModal, ModalOverlay } from 'react-aria-components';
import { XClose } from '@untitledui/icons';
import { cx } from '@/utils/cx';

interface ModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onOpenChange, title, children, size = 'md' }: ModalProps) {
  const maxWidth = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className={({ isEntering, isExiting }) =>
        cx(
          'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm',
          isEntering && 'duration-150 ease-out animate-in fade-in',
          isExiting && 'duration-100 ease-in animate-out fade-out',
        )
      }
    >
      <AriaModal
        className={({ isEntering, isExiting }) =>
          cx(
            'w-full rounded-2xl border border-border bg-surface p-6 shadow-lg outline-hidden',
            maxWidth,
            isEntering && 'duration-150 ease-out animate-in zoom-in-95',
            isExiting && 'duration-100 ease-in animate-out zoom-out-95',
          )
        }
      >
        <Dialog className="outline-hidden">
          {({ close }) => (
            <>
              <div className="flex items-center justify-between gap-4">
                <Heading slot="title" className="font-display text-lg font-semibold text-primary">
                  {title}
                </Heading>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="rounded-full p-1.5 text-tertiary transition-colors hover:bg-white/5 hover:text-primary"
                >
                  <XClose className="size-4" />
                </button>
              </div>
              <div className="mt-4 max-h-[70vh] overflow-y-auto">{children}</div>
            </>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}
