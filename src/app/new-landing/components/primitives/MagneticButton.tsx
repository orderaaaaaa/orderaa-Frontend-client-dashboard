'use client';

import { motion, useMotionValue, useSpring, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, useRef, type ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'ghost' | 'outline';

type MagneticButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant;
  fullWidth?: boolean;
  strength?: number;
  children?: ReactNode;
};

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ variant = 'primary', fullWidth, strength = 18, className, children, ...rest }, ref) => {
    const reduced = useReducedMotion();
    const localRef = useRef<HTMLButtonElement | null>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 220, damping: 18 });
    const sy = useSpring(y, { stiffness: 220, damping: 18 });

    const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (reduced) return;
      const el = localRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      x.set(((e.clientX - cx) / r.width) * strength);
      y.set(((e.clientY - cy) / r.height) * strength);
    };

    const onLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.button
        ref={(node) => {
          localRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        style={{ x: sx, y: sy }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={clsx(
          'relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold transition-shadow duration-300 will-change-transform disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nl-primary-2)]',
          variant === 'primary' &&
            'bg-gradient-to-l from-[#7B2CFF] via-[#5d24e1] to-[#3A0CA3] text-white shadow-[0_10px_40px_-10px_rgba(123,44,255,0.65)] hover:shadow-[0_18px_60px_-10px_rgba(123,44,255,0.9)]',
          variant === 'outline' &&
            'border border-white/15 bg-white/[0.03] text-[var(--nl-text)] backdrop-blur-md hover:bg-white/[0.07]',
          variant === 'ghost' && 'text-[var(--nl-text-mute)] hover:text-[var(--nl-text)]',
          fullWidth && 'w-full',
          className,
        )}
        {...rest}
      >
        {variant === 'primary' && (
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)] opacity-60" />
        )}
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </motion.button>
    );
  },
);

MagneticButton.displayName = 'MagneticButton';
