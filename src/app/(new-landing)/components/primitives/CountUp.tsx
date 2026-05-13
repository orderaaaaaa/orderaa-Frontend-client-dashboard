'use client';

import { useEffect, useState } from 'react';
import { useInView } from './useInView';

type CountUpProps = {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  triggerOnView?: boolean;
};

export function CountUp({
  to,
  duration = 1.6,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  triggerOnView = true,
}: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({
    rootMargin: '0px 0px -50px 0px',
  });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (triggerOnView && !inView) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setValue(to);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, triggerOnView]);

  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
