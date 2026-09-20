export const RECEIVING_STATUSES = ['pending', 'received', 'all'] as const;
export type ReceivingStatus = (typeof RECEIVING_STATUSES)[number];
export const DEFAULT_RECEIVING_STATUS: ReceivingStatus = 'pending';
export const RECEIVING_STATUS_OPTIONS: { value: ReceivingStatus; label: string }[] = [
  { value: 'pending', label: 'قيد الاستلام' },
  { value: 'received', label: 'مستلمة' },
  { value: 'all', label: 'الكل' },
];
export const receivingStatusToApproved = (status: ReceivingStatus): boolean | undefined =>
  status === 'all' ? undefined : status === 'received';
export const receivedBadgeLabel = (isApproved: boolean) =>
  isApproved ? 'مستلمة' : 'قيد الاستلام';
