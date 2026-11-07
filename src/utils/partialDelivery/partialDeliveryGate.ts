import type { TranslationKey } from '@/i18n/translate';
import { PERMISSIONS, orderStatusSetCodeOf, type PermissionCode } from '@/lib/permissions';
import { IN_PROCESS_STATUSES } from '@/types/shippingProviders';
import type { ShippingImplementation } from '@/types/shippingCompanies';

const PARTIAL_DELIVERY_STATUS_KEYS = ['RETURNED_DELIVERED', 'DELIVERED'] as const;

export const PARTIAL_DELIVERY_CODES: PermissionCode[] = [
  PERMISSIONS.ORDERS_UPDATE,
  ...PARTIAL_DELIVERY_STATUS_KEYS.flatMap((status) => orderStatusSetCodeOf(status) ?? []),
];

const PARTIAL_DELIVERY_BLOCK_REASON_KEYS = {
  locked: 'inProcess.reason.locked',
  status: 'inProcess.reason.partialStatus',
  alreadySplit: 'inProcess.reason.partialAlreadySplit',
  oneLine: 'inProcess.reason.partialOneLine',
} as const satisfies Record<string, TranslationKey>;

export type PartialDeliveryAction = { visible: boolean; blockedKey: TranslationKey | null };

const splitBlockReasonKeyOf = ({
  lineCount,
  hasReturnChild,
}: {
  lineCount: number;
  hasReturnChild: boolean;
}): TranslationKey | null => {
  if (hasReturnChild) return PARTIAL_DELIVERY_BLOCK_REASON_KEYS.alreadySplit;
  if (lineCount < 2) return PARTIAL_DELIVERY_BLOCK_REASON_KEYS.oneLine;
  return null;
};

export const partialDeliveryBlockReasonOf = ({
  locked,
  status,
  lineCount,
  hasReturnChild,
}: {
  locked: boolean;
  status: string;
  lineCount: number;
  hasReturnChild: boolean;
}): TranslationKey | null => {
  if (locked) return PARTIAL_DELIVERY_BLOCK_REASON_KEYS.locked;
  if (!(IN_PROCESS_STATUSES as readonly string[]).includes(status)) return PARTIAL_DELIVERY_BLOCK_REASON_KEYS.status;
  return splitBlockReasonKeyOf({ lineCount, hasReturnChild });
};

const canSplitDelivered = ({
  status,
  carrierImplementation,
  settlementAmount,
  hasActiveShippingId,
}: {
  status: string;
  carrierImplementation: ShippingImplementation | undefined;
  settlementAmount: string | null;
  hasActiveShippingId: boolean;
}): boolean =>
  status === 'DELIVERED' &&
  carrierImplementation === 'TURBO' &&
  settlementAmount === null &&
  hasActiveShippingId;

export const orderPagePartialActionOf = ({
  status,
  lineCount,
  hasReturnChild,
  frozen,
  carrierImplementation,
  settlementAmount,
  hasActiveShippingId,
}: {
  status: string;
  lineCount: number;
  hasReturnChild: boolean;
  frozen: boolean;
  carrierImplementation: ShippingImplementation | undefined;
  settlementAmount: string | null;
  hasActiveShippingId: boolean;
}): PartialDeliveryAction => {
  if (frozen) return { visible: false, blockedKey: null };
  const inTransit = (IN_PROCESS_STATUSES as readonly string[]).includes(status);
  if (!inTransit && !canSplitDelivered({ status, carrierImplementation, settlementAmount, hasActiveShippingId })) {
    return { visible: false, blockedKey: null };
  }
  return { visible: true, blockedKey: splitBlockReasonKeyOf({ lineCount, hasReturnChild }) };
};
