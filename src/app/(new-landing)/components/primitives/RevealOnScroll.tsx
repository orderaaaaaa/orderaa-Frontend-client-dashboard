'use client';

import { ReactNode, createElement } from 'react';
import clsx from 'clsx';
import { useInView } from './useInView';

type RevealOnScrollProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span';
};

export function RevealOnScroll({
  children,
  delay = 0,
  className,
  as = 'div',
}: RevealOnScrollProps) {
  const { ref, inView } = useInView<HTMLElement>();

  return createElement(
    as,
    {
      ref,
      className: clsx('nl-reveal', inView && 'is-visible', className),
      style: delay > 0 ? { transitionDelay: `${delay}s` } : undefined,
    },
    children,
  );
}
