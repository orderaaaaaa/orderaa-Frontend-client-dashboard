'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';

export const NOTE_BODY_CLASS = 'whitespace-pre-wrap break-words text-base leading-7 text-foreground';
export const NOTE_WRITER_CLASS = 'break-words text-sm font-semibold text-foreground';

interface NoteCardProps {
  meta: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'legacy';
  tone?: string;
  writer?: ReactNode;
  children: ReactNode;
}

export function NoteCard({ meta, footer, variant = 'default', tone, writer, children }: NoteCardProps) {
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
        {writer && <span className={NOTE_WRITER_CLASS}>{writer}</span>}
        {meta}
      </div>
      {children}
      {footer && <div className="flex items-center justify-end gap-1">{footer}</div>}
    </li>
  );
}
