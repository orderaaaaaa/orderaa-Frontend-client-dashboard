'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';

export const NOTE_BODY_CLASS = 'whitespace-pre-wrap break-words text-base leading-7 text-foreground';

interface NoteCardProps {
  meta: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'legacy';
  tone?: string;
  children: ReactNode;
}

export function NoteCard({ meta, footer, variant = 'default', tone, children }: NoteCardProps) {
  return (
    <li
      className={clsx(
        'flex flex-col gap-2 rounded-xl border p-3',
        variant === 'legacy' ? 'border-dashed border-border bg-background' : (tone ?? 'border-border bg-muted/40')
      )}
    >
      <div
        className={clsx(
          'flex flex-wrap items-center gap-x-2 gap-y-1 text-xs',
          tone ? 'text-foreground-muted' : 'text-muted-foreground'
        )}
      >
        {meta}
      </div>
      {children}
      {footer && <div className="flex items-center justify-end gap-1">{footer}</div>}
    </li>
  );
}
