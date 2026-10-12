import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SettlementShippingInfo } from '@/lib/api/settlement';
import { SettlementShippingDisclosure } from './SettlementShippingColumns';

export interface SettlementMobileField {
  label: string;
  value: ReactNode;
  className?: string;
}

interface SettlementMobileListProps {
  children: ReactNode;
  className?: string;
}

export function SettlementMobileList({ children, className }: SettlementMobileListProps) {
  return (
    <ul className={cn('sm:hidden divide-y rounded-md border bg-white', className)}>
      {children}
    </ul>
  );
}

interface SettlementMobileRowProps {
  fields: SettlementMobileField[];
  leading?: ReactNode;
  alert?: ReactNode;
  shipping?: SettlementShippingInfo | null;
  actions?: ReactNode;
  className?: string;
}

export function SettlementMobileRow({
  fields,
  leading,
  alert,
  shipping,
  actions,
  className,
}: SettlementMobileRowProps) {
  return (
    <li className={cn('flex flex-col gap-3 p-3', className)}>
      {alert}
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
      {shipping !== undefined && <SettlementShippingDisclosure shipping={shipping} />}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </li>
  );
}
