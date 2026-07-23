import type { ReactNode } from 'react';
import { CheckCircle, MessageSquare01, Target01, XCircle } from '@untitledui/icons';
import { SpotlightCard } from '@/components/SpotlightCard';
import { ScoreBadge } from './ScoreBadge';
import type { ResumeAnalysis } from '../types/ai.types';

function spotlightColorFor(score: number): string {
  if (score >= 8) return 'rgba(34, 197, 94, 0.18)';
  if (score >= 5) return 'rgba(245, 158, 11, 0.18)';
  return 'rgba(239, 68, 68, 0.18)';
}

function Section({ icon: Icon, title, children }: { icon: typeof CheckCircle; title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-cta-light" />
        <h3 className="text-xs font-bold uppercase tracking-wide text-tertiary">{title}</h3>
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

interface AnalysisResultViewProps {
  analysis: ResumeAnalysis;
  /**
   * 'card' (default): full hero with SpotlightCard, ScoreBadge, filename and date.
   * 'compact': just the sections — used inside the history accordion, whose
   * own trigger header already shows filename, date and a score chip.
   */
  variant?: 'card' | 'compact';
}

export function AnalysisResultView({ analysis, variant = 'card' }: AnalysisResultViewProps) {
  const sections = (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {analysis.strengths.length > 0 && (
          <Section icon={CheckCircle} title="Strengths">
            <ul className="space-y-1.5 text-sm text-secondary">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-latam-yes">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {analysis.gaps.length > 0 && (
          <Section icon={XCircle} title="Gaps">
            <ul className="space-y-1.5 text-sm text-secondary">
              {analysis.gaps.map((g, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-latam-no">−</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {analysis.improvements.length > 0 && (
        <Section icon={Target01} title="Improvements">
          <ul className="space-y-2.5 text-sm text-secondary">
            {analysis.improvements.map((imp, i) => (
              <li key={i}>
                <span className="font-semibold text-primary">{imp.area}</span>
                <p className="mt-0.5">{imp.suggestion}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section icon={MessageSquare01} title="Verdict">
        <p className="text-sm italic text-secondary">"{analysis.verdict}"</p>
      </Section>
    </>
  );

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-secondary">{analysis.summary}</p>
        {sections}
      </div>
    );
  }

  return (
    <SpotlightCard spotlightColor={spotlightColorFor(analysis.score)} className="border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-4">
        <ScoreBadge score={analysis.score} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-primary">{analysis.resumeFilename}</p>
          <p className="text-xs text-tertiary">{new Date(analysis.createdAt).toLocaleString()}</p>
          <p className="mt-2 text-sm leading-relaxed text-secondary">{analysis.summary}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">{sections}</div>
    </SpotlightCard>
  );
}
