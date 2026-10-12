import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StackedField {
  label: string;
  value: ReactNode;
  className?: string;
}

interface StackedListProps {
  children: ReactNode;
  className?: string;
  label?: string;
}

export function StackedList({ children, className, label }: StackedListProps) {
  return (
    <ul
      aria-label={label}
      className={cn('sm:hidden divide-y rounded-md border bg-white', className)}
    >
      {children}
    </ul>
  );
}

interface StackedRowProps {
  fields: StackedField[];
  title?: ReactNode;
  leading?: ReactNode;
  alert?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function StackedRow({
  fields,
  title,
  leading,
  alert,
  actions,
  children,
  className,
}: StackedRowProps) {
  return (
    <li className={cn('flex flex-col gap-3 p-3', className)}>
      {alert}
      {title && <div className="min-w-0 break-words font-medium">{title}</div>}
      <div className="flex items-start gap-2">
        {leading}
        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-2 text-sm">
          {fields.map((field) => (
            <div key={field.label} className={cn('min-w-0', field.className)}>
              <dt className="text-xs text-muted-foreground">{field.label}</dt>
              <dd className="font-medium break-words">{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      {children}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </li>
  );
}
