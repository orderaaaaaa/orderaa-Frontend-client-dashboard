import type { TranslationKey } from '@/i18n/translate';
import { PERMISSIONS, orderStatusSetCodeOf, type PermissionCode } from '@/lib/permissions';
import { IN_PROCESS_STATUSES } from '@/types/shippingProviders';

const PARTIAL_DELIVERY_STATUS_KEYS = ['RETURNED_DELIVERED', 'DELIVERED'] as const;

export const PARTIAL_DELIVERY_CODES: PermissionCode[] = [
  PERMISSIONS.ORDERS_UPDATE,
  ...PARTIAL_DELIVERY_STATUS_KEYS.flatMap((status) => orderStatusSetCodeOf(status) ?? []),
];

const PARTIAL_DELIVERY_BLOCK_REASON_KEYS = {
  locked: 'inProcess.reason.locked',
  status: 'inProcess.reason.partialStatus',
} as const satisfies Record<string, TranslationKey>;

export const partialDeliveryBlockReasonOf = ({
  locked,
  status,
}: {
  locked: boolean;
  status: string;
}): TranslationKey | null => {
  if (locked) return PARTIAL_DELIVERY_BLOCK_REASON_KEYS.locked;
  if (!(IN_PROCESS_STATUSES as readonly string[]).includes(status)) return PARTIAL_DELIVERY_BLOCK_REASON_KEYS.status;
  return null;
};
