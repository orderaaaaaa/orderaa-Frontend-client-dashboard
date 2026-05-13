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
  y = 20,
  className,
  as = 'div',
}: RevealOnScrollProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduced) {
    return <MotionTag className={clsx(className)}>{children}</MotionTag>;
  }

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <MotionTag
      className={clsx(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: '0px 0px 200px 0px' }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
