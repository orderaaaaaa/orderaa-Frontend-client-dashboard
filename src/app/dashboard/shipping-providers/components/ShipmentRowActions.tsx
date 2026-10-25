'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import { PERMISSIONS, type PermissionCode } from '@/lib/permissions';
import { useCloseClosure, useUndoClosure } from '@/services/shippingProviders';
import type { FollowupClosure, FollowupClosureKind } from '@/types/logistics';
import { ClosureReasonModal, type ClosureReasonKind } from './ClosureReasonModal';

type ClosureActionId = 'close' | 'refuse' | 'cancel' | 'reopen';

interface RowAction {
  id: ClosureActionId;
  labelKey: 'closure.close' | 'closure.refuse' | 'closure.cancel' | 'closure.reopen';
  code: PermissionCode;
  disabled: boolean;
  onSelect: () => void;
}

const CLOSURE_KIND_LABELS: Record<FollowupClosureKind, string> = {
  CLOSED_TODAY: 'مغلق لليوم',
  REFUSE: 'مرفوض',
  CANCEL: 'ملغي',
};

interface ShipmentRowActionsProps {
  orderId: number;
  closure: FollowupClosure | null;
}

export function ShipmentRowActions({ orderId, closure }: ShipmentRowActionsProps) {
  const { t } = useI18n();
  const { hasPermission } = usePermissionCheck();
  const [reasonKind, setReasonKind] = useState<ClosureReasonKind | null>(null);
  const closeMutation = useCloseClosure();
  const undoMutation = useUndoClosure();

  const isLocked = closure?.kind === 'REFUSE' || closure?.kind === 'CANCEL';
  const isPending = closeMutation.isPending || undoMutation.isPending;

  const actions: RowAction[] = [
    {
      id: 'close',
      labelKey: 'closure.close',
      code: PERMISSIONS.FOLLOWUP_MANAGE,
      disabled: closure !== null,
      onSelect: () => closeMutation.mutate(orderId),
    },
    {
      id: 'refuse',
      labelKey: 'closure.refuse',
      code: PERMISSIONS.FOLLOWUP_MANAGE,
      disabled: isLocked,
      onSelect: () => setReasonKind('REFUSE'),
    },
    {
      id: 'cancel',
      labelKey: 'closure.cancel',
      code: PERMISSIONS.FOLLOWUP_MANAGE,
      disabled: isLocked,
      onSelect: () => setReasonKind('CANCEL'),
    },
  ];

  if (closure !== null) {
    actions.push({
      id: 'reopen',
      labelKey: 'closure.reopen',
      code: PERMISSIONS.FOLLOWUP_MANAGE,
      disabled: false,
      onSelect: () => undoMutation.mutate(orderId),
    });
  }

  const visibleActions = actions.filter((action) => hasPermission(action.code));
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
              onClick={action.onSelect}
            >
              {t(action.labelKey)}
            </Button>
          ))}
        </div>
      )}
      {reasonKind !== null && (
        <ClosureReasonModal
          kind={reasonKind}
          orderId={orderId}
          onClose={() => setReasonKind(null)}
        />
      )}
    </div>
  );
}
