'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import PartialDeliveryModal from '@/components/OrderDetails/ActionModals/PartialDeliveryModal';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import { PERMISSIONS, orderStatusSetCodeOf, type PermissionCode } from '@/lib/permissions';
import { orderDetailsQueryOptions } from '@/services/orders';
import { useCloseClosure, useUndoClosure } from '@/services/shippingProviders';
import { getApiErrorMessage } from '@/utils/apiError';
import type { FollowupClosure, FollowupClosureKind } from '@/types/logistics';
import { ClosureReasonModal, type ClosureReasonKind } from './ClosureReasonModal';
import {
  FOLLOWUP_ACTION_LOG_BUTTON_LABEL,
  FOLLOWUP_NOTES_BUTTON_LABEL,
} from './followupNotesConstants';

type ClosureActionId = 'partial' | 'close' | 'refuse' | 'cancel' | 'reopen';

interface RowAction {
  id: ClosureActionId;
  labelKey: 'closure.partial' | 'closure.close' | 'closure.refuse' | 'closure.cancel' | 'closure.reopen';
  codes: PermissionCode[];
  disabled: boolean;
  disabledReason?: string;
  onSelect: () => void;
}

export interface PartialDeliveryAccess {
  blockedReason: string | null;
  pending: boolean;
}

const PARTIAL_DELIVERY_STATUS_KEYS = ['RETURNED_DELIVERED', 'DELIVERED'] as const;

const PARTIAL_DELIVERY_CODES: PermissionCode[] = [
  PERMISSIONS.ORDERS_UPDATE,
  ...PARTIAL_DELIVERY_STATUS_KEYS.flatMap((status) => orderStatusSetCodeOf(status) ?? []),
];

const CLOSURE_KIND_LABELS: Record<FollowupClosureKind, string> = {
  CLOSED_TODAY: 'مغلق لليوم',
  REFUSE: 'مرفوض',
  CANCEL: 'ملغي',
};

export interface FollowupRowTools {
  onOpenNotes: () => void;
  onOpenActionLog: () => void;
}

interface ShipmentRowActionsProps {
  orderId: number;
  closure: FollowupClosure | null;
  partialDelivery?: PartialDeliveryAccess;
  followupTools?: FollowupRowTools;
}

export function ShipmentRowActions({
  orderId,
  closure,
  partialDelivery,
  followupTools,
}: ShipmentRowActionsProps) {
  const { t } = useI18n();
  const { hasAllPermissions } = usePermissionCheck();
  const [reasonKind, setReasonKind] = useState<ClosureReasonKind | null>(null);
  const [isPartialOpen, setIsPartialOpen] = useState(false);
  const closeMutation = useCloseClosure();
  const undoMutation = useUndoClosure();
  const orderQuery = useQuery({ ...orderDetailsQueryOptions(orderId), enabled: isPartialOpen });

  useEffect(() => {
    if (!orderQuery.isError) return;
    toast.error(getApiErrorMessage(orderQuery.error, 'تعذر تحميل تفاصيل الطلب'));
    setIsPartialOpen(false);
  }, [orderQuery.isError, orderQuery.error]);

  const isLocked = closure?.kind === 'REFUSE' || closure?.kind === 'CANCEL';
  const isPending = closeMutation.isPending || undoMutation.isPending;
  const partialUnavailable =
    partialDelivery !== undefined && (partialDelivery.pending || partialDelivery.blockedReason !== null);

  const actions: RowAction[] = [
    ...(partialDelivery
      ? [
          {
            id: 'partial' as const,
            labelKey: 'closure.partial' as const,
            codes: PARTIAL_DELIVERY_CODES,
            disabled: partialUnavailable,
            disabledReason: partialDelivery?.blockedReason ?? undefined,
            onSelect: () => setIsPartialOpen(true),
          },
        ]
      : []),
    {
      id: 'close',
      labelKey: 'closure.close',
      codes: [PERMISSIONS.FOLLOWUP_MANAGE],
      disabled: closure !== null,
      onSelect: () => closeMutation.mutate(orderId),
    },
    {
      id: 'refuse',
      labelKey: 'closure.refuse',
      codes: [PERMISSIONS.FOLLOWUP_MANAGE],
      disabled: isLocked,
      onSelect: () => setReasonKind('REFUSE'),
    },
    {
      id: 'cancel',
      labelKey: 'closure.cancel',
      codes: [PERMISSIONS.FOLLOWUP_MANAGE],
      disabled: isLocked,
      onSelect: () => setReasonKind('CANCEL'),
    },
  ];

  if (closure !== null) {
    actions.push({
      id: 'reopen',
      labelKey: 'closure.reopen',
      codes: [PERMISSIONS.FOLLOWUP_MANAGE],
      disabled: false,
      onSelect: () => undoMutation.mutate(orderId),
    });
  }

  const visibleActions = actions.filter((action) => hasAllPermissions(action.codes));
  const closureReason = closure?.reasonName ?? closure?.reasonText ?? null;

  return (
    <div className="flex flex-col gap-2 min-w-[11rem]">
      {closure !== null && (
        <p className="text-xs text-gray-700">
          <span className="font-semibold">{CLOSURE_KIND_LABELS[closure.kind]}</span>
          {closureReason && <span className="text-gray-500"> - {closureReason}</span>}
        </p>
      )}
      {visibleActions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {visibleActions.map((action) => (
            <Button
              key={action.id}
              type="button"
              variant={action.id === 'reopen' ? 'outline' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={action.disabled || isPending}
              title={action.disabledReason}
              onClick={action.onSelect}
            >
              {t(action.labelKey)}
            </Button>
          ))}
        </div>
      )}
      {followupTools && (
        <Can code={PERMISSIONS.FOLLOWUP_READ}>
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={followupTools.onOpenNotes}
            >
              {FOLLOWUP_NOTES_BUTTON_LABEL}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={followupTools.onOpenActionLog}
            >
              {FOLLOWUP_ACTION_LOG_BUTTON_LABEL}
            </Button>
          </div>
        </Can>
      )}
      {reasonKind !== null && (
        <ClosureReasonModal
          kind={reasonKind}
          orderId={orderId}
          onClose={() => setReasonKind(null)}
        />
      )}
      {isPartialOpen && orderQuery.data && (
        <PartialDeliveryModal
          isOpen
          onClose={() => setIsPartialOpen(false)}
          orderId={orderId}
          orderStatus={orderQuery.data.status}
          orderProducts={orderQuery.data.order_products}
          totalCost={orderQuery.data.totalCost}
        />
      )}
    </div>
  );
}
