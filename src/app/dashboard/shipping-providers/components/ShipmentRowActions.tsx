'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Ban,
  CalendarX,
  PackageCheck,
  PackageSearch,
  RotateCcw,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { LiaEllipsisVSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import ChangeProductsModal from '@/components/orders/ChangeProductsModal';
import PartialDeliveryModal from '@/components/OrderDetails/ActionModals/PartialDeliveryModal';
import { Button } from '@/components/ui/button';
import CopyableCode from '@/components/ui/copyable-code';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import { closureKindAnyOfCodes } from '@/lib/followupClosurePermissions';
import { PERMISSIONS, orderStatusSetCodeOf, type PermissionCode } from '@/lib/permissions';
import { orderDetailsQueryOptions } from '@/services/orders';
import { KEY as SHIPPING_PROVIDERS_KEY, useCloseClosure, useUndoClosure } from '@/services/shippingProviders';
import { getApiErrorMessage } from '@/utils/apiError';
import type { FollowupClosure, FollowupClosureKind } from '@/types/logistics';
import type { OrderStatus } from '@/types/orders';
import type { ShippingImplementation } from '@/types/shippingCompanies';
import { ClosureReasonModal, type ClosureReasonKind } from './ClosureReasonModal';
import { ExchangeCandidatesModal } from './ExchangeCandidatesModal';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';

type ClosureActionId = 'partial' | 'changeProducts' | 'exchange' | 'close' | 'refuse' | 'cancel' | 'reopen';

type ActionGroupId = 'delivery' | 'closure';

interface RowAction {
  id: ClosureActionId;
  labelKey:
    | 'closure.partial'
    | 'closure.changeProducts'
    | 'closure.exchange'
    | 'closure.close'
    | 'closure.refuse'
    | 'closure.cancel'
    | 'closure.reopen';
  icon: LucideIcon;
  group: ActionGroupId;
  opensModal: boolean;
  codes: PermissionCode[];
  anyOfCodes?: PermissionCode[];
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

const ACTION_GROUPS: { id: ActionGroupId; title: string }[] = [
  { id: 'delivery', title: 'التسليم' },
  { id: 'closure', title: 'المتابعة اليومية' },
];

interface ShipmentRowActionsProps {
  orderId: number;
  orderCode: string;
  customerName: string | null;
  status: OrderStatus;
  closure: FollowupClosure | null;
  partialDelivery?: PartialDeliveryAccess;
  carrierImplementation?: ShippingImplementation;
}

export function ShipmentRowActions({
  orderId,
  orderCode,
  customerName,
  status,
  closure,
  partialDelivery,
  carrierImplementation,
}: ShipmentRowActionsProps) {
  const { t } = useI18n();
  const { hasAllPermissions, hasAnyPermission } = usePermissionCheck();
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pendingActionRef = useRef<RowAction | null>(null);
  const [reasonKind, setReasonKind] = useState<ClosureReasonKind | null>(null);
  const [isPartialOpen, setIsPartialOpen] = useState(false);
  const [isChangeProductsOpen, setIsChangeProductsOpen] = useState(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const queryClient = useQueryClient();
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
  const isInProcessRow = partialDelivery !== undefined;

  const actions: RowAction[] = [
    ...(partialDelivery
      ? [
          {
            id: 'partial' as const,
            labelKey: 'closure.partial' as const,
            icon: PackageCheck,
            group: 'delivery' as const,
            opensModal: true,
            codes: PARTIAL_DELIVERY_CODES,
            disabled: partialUnavailable,
            disabledReason: partialDelivery?.blockedReason ?? undefined,
            onSelect: () => setIsPartialOpen(true),
          },
        ]
      : []),
    ...(isInProcessRow
      ? [
          {
            id: 'changeProducts' as const,
            labelKey: 'closure.changeProducts' as const,
            icon: PackageSearch,
            group: 'delivery' as const,
            opensModal: true,
            codes: [PERMISSIONS.FOLLOWUP_MANAGE],
            disabled: isLocked,
            onSelect: () => setIsChangeProductsOpen(true),
          },
          {
            id: 'exchange' as const,
            labelKey: 'closure.exchange' as const,
            icon: ArrowLeftRight,
            group: 'delivery' as const,
            opensModal: true,
            codes: [PERMISSIONS.FOLLOWUP_READ],
            disabled: false,
            onSelect: () => setIsExchangeOpen(true),
          },
        ]
      : []),
    {
      id: 'close',
      labelKey: 'closure.close',
      icon: CalendarX,
      group: 'closure',
      opensModal: false,
      codes: [],
      anyOfCodes: closureKindAnyOfCodes('CLOSED_TODAY'),
      disabled: closure !== null,
      onSelect: () => closeMutation.mutate(orderId),
    },
    {
      id: 'refuse',
      labelKey: 'closure.refuse',
      icon: Ban,
      group: 'closure',
      opensModal: true,
      codes: [],
      anyOfCodes: closureKindAnyOfCodes('REFUSE'),
      disabled: isLocked,
      onSelect: () => setReasonKind('REFUSE'),
    },
    {
      id: 'cancel',
      labelKey: 'closure.cancel',
      icon: XCircle,
      group: 'closure',
      opensModal: true,
      codes: [],
      anyOfCodes: closureKindAnyOfCodes('CANCEL'),
      disabled: isLocked,
      onSelect: () => setReasonKind('CANCEL'),
    },
  ];

  if (closure !== null) {
    actions.push({
      id: 'reopen',
      labelKey: 'closure.reopen',
      icon: RotateCcw,
      group: 'closure',
      opensModal: false,
      codes: [],
      anyOfCodes: closureKindAnyOfCodes(closure.kind),
      disabled: false,
      onSelect: () => undoMutation.mutate(orderId),
    });
  }

  const isActionVisible = (action: RowAction): boolean =>
    hasAllPermissions(action.codes) && (!action.anyOfCodes || hasAnyPermission(action.anyOfCodes));
  const visibleActions = actions.filter(isActionVisible);
  const closureReason = closure?.reasonName ?? closure?.reasonText ?? null;
  const closureLine =
    closure !== null ? (
      <p className="text-xs text-gray-700">
        <span className="font-semibold">{CLOSURE_KIND_LABELS[closure.kind]}</span>
        {closureReason && <span className="text-gray-500"> - {closureReason}</span>}
      </p>
    ) : null;

  const chooseAction = (action: RowAction) => {
    setSheetOpen(false);
    if (action.opensModal) {
      pendingActionRef.current = action;
      return;
    }
    action.onSelect();
  };

  const handleSheetCloseAutoFocus = (event: Event) => {
    const pending = pendingActionRef.current;
    if (!pending) return;
    event.preventDefault();
    pendingActionRef.current = null;
    triggerRef.current?.focus();
    pending.onSelect();
  };

  return (
    <div className="flex flex-col gap-2">
      {closureLine}
      {visibleActions.length > 0 && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              ref={triggerRef}
              type="button"
              variant="ghost"
              size="touch"
              aria-label={`إجراءات الطلب ${orderCode}`}
              aria-haspopup="dialog"
            >
              <LiaEllipsisVSolid className="size-5 text-gray-600" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:max-w-sm p-0 gap-0"
            onCloseAutoFocus={handleSheetCloseAutoFocus}
          >
            <SheetHeader className="border-b p-4 text-right">
              <SheetTitle>إجراءات الطلب</SheetTitle>
              <SheetDescription>اختر الإجراء المطلوب لهذا الطلب</SheetDescription>
              <div className="flex flex-col gap-2 pt-2">
                <CopyableCode value={orderCode} label="نسخ كود الطلب">
                  <span className="font-mono font-medium text-gray-900">{orderCode}</span>
                </CopyableCode>
                <p className="text-sm text-gray-700">{customerName ?? '—'}</p>
                <ShipmentStatusBadge status={status} />
                {closureLine}
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-2">
              {ACTION_GROUPS.map((group) => {
                const groupActions = visibleActions.filter((action) => action.group === group.id);
                if (groupActions.length === 0) return null;
                return (
                  <section key={group.id} className="flex flex-col gap-1">
                    <h3 className="px-3 pt-2 text-xs font-semibold text-gray-500">{group.title}</h3>
                    {groupActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.id}
                          type="button"
                          variant="ghost"
                          className="h-auto w-full justify-start gap-3 py-3 text-sm"
                          disabled={action.disabled || isPending}
                          title={action.disabledReason}
                          onClick={() => chooseAction(action)}
                        >
                          <Icon className="size-4 text-gray-600" />
                          <span className="flex flex-col items-start gap-0.5 text-right">
                            <span>{t(action.labelKey)}</span>
                            {action.disabled && action.disabledReason && (
                              <span className="text-xs text-gray-500 whitespace-normal">
                                {action.disabledReason}
                              </span>
                            )}
                          </span>
                        </Button>
                      );
                    })}
                  </section>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      )}
      {reasonKind !== null && (
        <ClosureReasonModal
          kind={reasonKind}
          orderId={orderId}
          onClose={() => setReasonKind(null)}
        />
      )}
      {isChangeProductsOpen && (
        <ChangeProductsModal
          isOpen
          onClose={() => setIsChangeProductsOpen(false)}
          orderId={orderId}
          onDone={() => {
            void queryClient.invalidateQueries({ queryKey: [SHIPPING_PROVIDERS_KEY] });
          }}
        />
      )}
      {isExchangeOpen && (
        <ExchangeCandidatesModal isOpen onClose={() => setIsExchangeOpen(false)} orderId={orderId} />
      )}
      {isPartialOpen && orderQuery.data && (
        <PartialDeliveryModal
          isOpen
          onClose={() => setIsPartialOpen(false)}
          orderId={orderId}
          orderStatus={orderQuery.data.status}
          orderProducts={orderQuery.data.order_products}
          totalCost={orderQuery.data.totalCost}
          carrierImplementation={carrierImplementation}
        />
      )}
    </div>
  );
}
