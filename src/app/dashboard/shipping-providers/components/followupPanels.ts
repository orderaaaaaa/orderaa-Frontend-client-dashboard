import type { InProcessShipment, ShipmentRowBase } from '@/types/shippingProviders';

export const FOLLOWUP_PANELS = { NOTES: 'notes', EVENTS: 'events', CHAT: 'chat' } as const;

export type FollowupPanel = (typeof FOLLOWUP_PANELS)[keyof typeof FOLLOWUP_PANELS];

export interface FollowupTarget {
  orderId: number;
  orderCode: string;
  shippingCode: string | null;
  customerName: string | null;
  status: ShipmentRowBase['status'];
  lateness: InProcessShipment['lateness'];
  governorate: string | null;
  unreadNoteCount: number;
  panel: FollowupPanel;
}

export function followupTargetOf(
  row: ShipmentRowBase & { lateness?: InProcessShipment['lateness'] },
  panel: FollowupPanel
): FollowupTarget {
  return {
    orderId: row.id,
    orderCode: row.code,
    shippingCode: row.shippingCode,
    customerName: row.customer.name,
    status: row.status,
    lateness: row.lateness ?? null,
    governorate: row.governorate,
    unreadNoteCount: row.unreadNoteCount ?? 0,
    panel,
  };
}

export type FollowupOpenHandler = (target: FollowupTarget, opener: HTMLElement | null) => void;
