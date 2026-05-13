'use client';

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion';
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
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  const background = useMotionTemplate`radial-gradient(${intensity}px circle at ${mx}px ${my}px, ${glowColor}, transparent 70%)`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const onLeave = () => {
    mx.set(-200);
    my.set(-200);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={clsx(
        'group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm transition-colors',
        'hover:border-white/[0.18]',
        className,
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="pointer-events-none absolute inset-px rounded-[calc(theme(borderRadius.3xl)-1px)] bg-gradient-to-b from-white/[0.04] to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
