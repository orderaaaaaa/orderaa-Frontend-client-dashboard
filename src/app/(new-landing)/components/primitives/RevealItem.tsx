'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';
import { useInView } from './useInView';

interface RevealItemProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function RevealItem({ children, delay = 0, className }: RevealItemProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={clsx('nl-reveal', inView && 'is-visible', className)}
      style={delay > 0 ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
