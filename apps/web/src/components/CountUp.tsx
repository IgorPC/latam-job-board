import { useCallback, useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';

// Adapted from reactbits.dev's CountUp (TS-TW variant) — animates a number
// spring-ing up to its target value once the element scrolls into view.
interface CountUpProps {
  to: number;
  from?: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 1,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? to : from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, { damping, stiffness });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  const getDecimalPlaces = useCallback((num: number): number => {
    const str = num.toString();
    if (str.includes('.')) {
      const decimals = str.split('.')[1];
      if (parseInt(decimals, 10) !== 0) return decimals.length;
    }
    return 0;
  }, []);

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0;
      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      };
      const formatted = Intl.NumberFormat('en-US', options).format(latest);
      return separator ? formatted.replace(/,/g, separator) : formatted;
    },
    [maxDecimals, separator],
  );

  useEffect(() => {
    if (ref.current) ref.current.textContent = formatValue(direction === 'down' ? to : from);
  }, [from, to, direction, formatValue]);

  useEffect(() => {
    if (isInView && startWhen) {
      onStart?.();
      const startTimeout = setTimeout(() => {
        motionValue.set(direction === 'down' ? from : to);
      }, delay * 1000);

      const endTimeout = setTimeout(() => onEnd?.(), delay * 1000 + duration * 1000);

      return () => {
        clearTimeout(startTimeout);
        clearTimeout(endTimeout);
      };
    }
  }, [isInView, startWhen, motionValue, direction, from, to, delay, duration, onStart, onEnd]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });
    return () => unsubscribe();
  }, [springValue, formatValue]);

  return <span className={className} ref={ref} />;
}
