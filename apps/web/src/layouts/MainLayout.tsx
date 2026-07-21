import type { PropsWithChildren } from 'react';
import { Header } from './Header';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { LinkedinIcon } from '@/components/icons/LinkedinIcon';

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-slate-600 sm:px-6">
        <p>Built for tech professionals across Latin America. Data refreshed daily at 9am.</p>
        <p className="mt-3 flex items-center justify-center gap-3">
          <span>Made by Igor Coutinho</span>
          <a
            href="https://github.com/IgorPC"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Igor Coutinho on GitHub"
            className="text-slate-500 transition-colors hover:text-primary"
          >
            <GithubIcon className="size-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/igor-p-coutinho/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Igor Coutinho on LinkedIn"
            className="text-slate-500 transition-colors hover:text-primary"
          >
            <LinkedinIcon className="size-4" />
          </a>
        </p>
      </footer>
    </div>
  );
}
