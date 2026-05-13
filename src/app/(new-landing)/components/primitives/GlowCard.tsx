'use client';

import { ReactNode, useRef } from 'react';
import clsx from 'clsx';

type GlowCardProps = {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
};

export function GlowCard({
  children,
  className,
  glowColor = 'rgba(123, 44, 255, 0.45)',
  intensity = 320,
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--glow-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--glow-y', `${e.clientY - r.top}px`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--glow-x', '-200px');
    el.style.setProperty('--glow-y', '-200px');
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        ['--glow-x' as string]: '-200px',
        ['--glow-y' as string]: '-200px',
      }}
      className={clsx(
        'group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm transition-colors',
        'hover:border-white/[0.18]',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${intensity}px circle at var(--glow-x) var(--glow-y), ${glowColor}, transparent 70%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-px rounded-[calc(theme(borderRadius.3xl)-1px)] bg-gradient-to-b from-white/[0.04] to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
