import type { OrderChangeBatch } from '@/types/orderChangeHistory';
import type { OrderEvent } from '@/types/orders';

export const ORDER_LEDGER_ENTRY_KIND = {
  EVENT: 'EVENT',
  CHANGE: 'CHANGE',
  ORDER_DELETION: 'ORDER_DELETION',
  ORDER_RESTORE: 'ORDER_RESTORE',
  PART_RESTORE: 'PART_RESTORE',
} as const;

export type OrderLedgerEntryKind =
  (typeof ORDER_LEDGER_ENTRY_KIND)[keyof typeof ORDER_LEDGER_ENTRY_KIND];

export type OrderLedgerEvent = OrderEvent & { type: string };

export interface OrderLedgerLifecycle {
  batchId: number;
  origin: string;
  actorName: string | null;
  linkedOrder: { id: number; code: string } | null;
  part: { id: number; code: string } | null;
}

export interface OrderLedgerEntry {
  key: string;
  kind: OrderLedgerEntryKind;
  at: string;
  event?: OrderLedgerEvent;
  change?: OrderChangeBatch;
  lifecycle?: OrderLedgerLifecycle;
}

export interface OrderLedger {
  changesVisible: boolean;
  entries: OrderLedgerEntry[];
}
