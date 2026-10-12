import type { ReactNode } from 'react';
import {
  StackedList,
  StackedRow,
  type StackedField,
} from '@/components/ui/stacked-list';
import type { SettlementShippingInfo } from '@/lib/api/settlement';
import { SettlementShippingDisclosure } from './SettlementShippingColumns';

export type SettlementMobileField = StackedField;

export const SettlementMobileList = StackedList;

interface SettlementMobileRowProps {
  fields: SettlementMobileField[];
  leading?: ReactNode;
  alert?: ReactNode;
  shipping?: SettlementShippingInfo | null;
  actions?: ReactNode;
  className?: string;
}

export function SettlementMobileRow({ shipping, ...row }: SettlementMobileRowProps) {
  return (
    <StackedRow {...row}>
      {shipping !== undefined && <SettlementShippingDisclosure shipping={shipping} />}
    </StackedRow>
  );
}
