'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ReactNode } from 'react';
import clsx from 'clsx';

type RevealOnScrollProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span';
};

export function RevealOnScroll({
  children,
  delay = 0,
  y = 40,
  className,
  as = 'div',
}: RevealOnScrollProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  const variants: Variants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <MotionTag
      className={clsx(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
