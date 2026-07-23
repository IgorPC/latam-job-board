import { useRef, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

// Adapted from reactbits.dev's SpotlightCard (TS-TW variant) — a card with a
// radial highlight that follows the cursor. The gradient itself is driven by
// CSS custom properties set on mousemove; the `.card-spotlight` rule lives in
// styles/index.css since Tailwind can't express a mouse-tracked ::before
// gradient as a utility class.
interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.25)' }: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = divRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    el.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={cn('card-spotlight relative overflow-hidden rounded-2xl', className)}>
      {children}
    </div>
  );
}
