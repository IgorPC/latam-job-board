import CountUp from '@/components/CountUp';
import { cn } from '@/utils/cn';

function tier(score: number): { text: string; ring: string; glow: string } {
  if (score >= 8) return { text: 'text-latam-yes', ring: 'ring-latam-yes/40', glow: 'shadow-[0_0_40px_-8px_var(--color-latam-yes)]' };
  if (score >= 5) return { text: 'text-latam-maybe', ring: 'ring-latam-maybe/40', glow: 'shadow-[0_0_40px_-8px_var(--color-latam-maybe)]' };
  return { text: 'text-latam-no', ring: 'ring-latam-no/40', glow: 'shadow-[0_0_40px_-8px_var(--color-latam-no)]' };
}

export function ScoreBadge({ score }: { score: number }) {
  // Defensive: MySQL/TypeORM `decimal` columns can come back as strings on
  // rows written before the entity's number transformer was added.
  const numericScore = Number(score) || 0;
  const t = tier(numericScore);

  return (
    <div className={cn('flex size-24 shrink-0 flex-col items-center justify-center rounded-full bg-background/60 ring-4', t.ring, t.glow)}>
      <span className={cn('font-display text-3xl font-bold leading-none', t.text)}>
        <CountUp to={numericScore} from={0} duration={1.2} />
      </span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-tertiary">out of 10</span>
    </div>
  );
}
