'use client';

import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Ban,
  CalendarX,
  Clock,
  Flag,
  History,
  MessageSquareText,
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
import { Separator } from '@/components/ui/separator';
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
import type { TranslationKey } from '@/i18n/translate';
import { closureKindAnyOfCodes } from '@/lib/followupClosurePermissions';
import { PERMISSIONS, orderStatusSetCodeOf, type PermissionCode } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { orderDetailsQueryOptions } from '@/services/orders';
import { KEY as SHIPPING_PROVIDERS_KEY, useCloseClosure, useUndoClosure } from '@/services/shippingProviders';
import { getApiErrorMessage } from '@/utils/apiError';
import type { FollowupClosure, FollowupClosureKind } from '@/types/logistics';
import type { OrderStatus } from '@/types/orders';
import type { LatenessInfo } from '@/types/shippingProviders';
import type { ShippingImplementation } from '@/types/shippingCompanies';
import { ClosureReasonModal, type ClosureReasonKind } from './ClosureReasonModal';
import { DeliveryWindowModal } from './DeliveryWindowModal';
import { ExchangeCandidatesModal } from './ExchangeCandidatesModal';
import { LatenessChip, latenessChipOf } from './LatenessChip';
import { LateMarkModal } from './LateMarkModal';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';

type ActionGroupId = 'follow' | 'delivery' | 'closure' | 'final';

interface RowAction {
  id: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  group: ActionGroupId;
  opensModal: boolean;
  awaitsDetails?: boolean;
  survivesPending?: boolean;
  destructive?: boolean;
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

export const CLOSURE_KIND_LABEL_KEYS: Record<FollowupClosureKind, TranslationKey> = {
  CLOSED_TODAY: 'inProcess.closure.closedToday',
  REFUSE: 'inProcess.closure.refused',
  CANCEL: 'inProcess.closure.cancelled',
};

export const closureReasonOf = (closure: FollowupClosure): string | null =>
  closure.reasonName ?? closure.reasonText;

const ACTION_GROUPS: { id: ActionGroupId; titleKey: TranslationKey }[] = [
  { id: 'follow', titleKey: 'inProcess.sheet.group.follow' },
  { id: 'delivery', titleKey: 'inProcess.sheet.group.edit' },
  { id: 'closure', titleKey: 'inProcess.sheet.group.closure' },
  { id: 'final', titleKey: 'inProcess.sheet.group.final' },
];

export interface ShipmentRowActionsProps {
  orderId: number;
  orderCode: string;
  customerName: string | null;
  status: OrderStatus;
  closure: FollowupClosure | null;
  partialDelivery?: PartialDeliveryAccess;
  carrierImplementation?: ShippingImplementation;
  shippingCompanyId?: number;
  lateness?: LatenessInfo | null;
  availableFrom?: string | null;
  availableTo?: string | null;
  rowLocked?: boolean;
  onOpenNotes?: () => void;
  onOpenActionLog?: () => void;
}

export function ShipmentRowActions({
  orderId,
  orderCode,
  customerName,
  status,
  closure,
  partialDelivery,
  carrierImplementation,
  shippingCompanyId,
  lateness,
  availableFrom,
  availableTo,
  rowLocked = false,
  onOpenNotes,
  onOpenActionLog,
}: ShipmentRowActionsProps) {
  const { t } = useI18n();
  const { hasAllPermissions, hasAnyPermission } = usePermissionCheck();
  const idPrefix = useId();
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const [reasonKind, setReasonKind] = useState<ClosureReasonKind | null>(null);
  const [isPartialOpen, setIsPartialOpen] = useState(false);
  const [partialRequested, setPartialRequested] = useState(false);
  const [isChangeProductsOpen, setIsChangeProductsOpen] = useState(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [isLateMarkOpen, setIsLateMarkOpen] = useState(false);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const queryClient = useQueryClient();
  const closeMutation = useCloseClosure();
  const undoMutation = useUndoClosure();
  const orderQuery = useQuery({ ...orderDetailsQueryOptions(orderId), enabled: isPartialOpen || partialRequested });

  useEffect(() => {
    if (!orderQuery.isError) return;
    toast.error(getApiErrorMessage(orderQuery.error, 'تعذر تحميل تفاصيل الطلب'));
    setPartialRequested(false);
  }, [orderQuery.isError, orderQuery.error]);

  useEffect(() => {
    if (!partialRequested || !orderQuery.isSuccess) return;
    setPartialRequested(false);
    pendingActionRef.current = () => setIsPartialOpen(true);
    setSheetOpen(false);
  }, [partialRequested, orderQuery.isSuccess]);

  const isLocked = closure?.kind === 'REFUSE' || closure?.kind === 'CANCEL';
  const isPending = closeMutation.isPending || undoMutation.isPending;
  const partialUnavailable =
    partialDelivery !== undefined && (partialDelivery.pending || partialDelivery.blockedReason !== null);
  const isInProcessRow = partialDelivery !== undefined;
  const lockedReason = isLocked ? t('inProcess.reason.locked') : undefined;
  const rowLockedReason = rowLocked ? t('inProcess.reason.locked') : undefined;

  const actions: RowAction[] = [
    ...(onOpenNotes
      ? [
          {
            id: 'notes',
            labelKey: 'inProcess.action.notes' as const,
            icon: MessageSquareText,
            group: 'follow' as const,
            opensModal: true,
            survivesPending: true,
            codes: [PERMISSIONS.FOLLOWUP_READ],
            disabled: false,
            onSelect: onOpenNotes,
          },
        ]
      : []),
    ...(onOpenActionLog
      ? [
          {
            id: 'log',
            labelKey: 'inProcess.action.log' as const,
            icon: History,
            group: 'follow' as const,
            opensModal: true,
            survivesPending: true,
            codes: [PERMISSIONS.FOLLOWUP_READ],
            disabled: false,
            onSelect: onOpenActionLog,
          },
        ]
      : []),
    ...(shippingCompanyId !== undefined
      ? [
          {
            id: 'late',
            labelKey: 'inProcess.action.late' as const,
            icon: Flag,
            group: 'follow' as const,
            opensModal: true,
            codes: [PERMISSIONS.FOLLOWUP_CARRIERS_LATE_MANAGE],
            disabled: rowLocked,
            disabledReason: rowLockedReason,
            onSelect: () => setIsLateMarkOpen(true),
          },
          {
            id: 'deliveryWindow',
            labelKey: 'inProcess.action.deliveryWindow' as const,
            icon: Clock,
            group: 'follow' as const,
            opensModal: true,
            codes: [PERMISSIONS.FOLLOWUP_CARRIERS_DELIVERY_MANAGE],
            disabled: rowLocked,
            disabledReason: rowLockedReason,
            onSelect: () => setIsWindowOpen(true),
          },
        ]
      : []),
    ...(partialDelivery
      ? [
          {
            id: 'partial',
            labelKey: 'closure.partial' as const,
            icon: PackageCheck,
            group: 'delivery' as const,
            opensModal: true,
            awaitsDetails: true,
            codes: PARTIAL_DELIVERY_CODES,
            disabled: partialUnavailable,
            disabledReason:
              partialDelivery.blockedReason ??
              (partialDelivery.pending ? t('inProcess.reason.loadingCarrier') : undefined),
            onSelect: () => setIsPartialOpen(true),
          },
        ]
      : []),
    ...(isInProcessRow
      ? [
          {
            id: 'changeProducts',
            labelKey: 'closure.changeProducts' as const,
            icon: PackageSearch,
            group: 'delivery' as const,
            opensModal: true,
            codes: [PERMISSIONS.FOLLOWUP_MANAGE],
            disabled: isLocked,
            disabledReason: lockedReason,
            onSelect: () => setIsChangeProductsOpen(true),
          },
          {
            id: 'exchange',
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
      disabledReason: closure !== null ? t('inProcess.reason.alreadyClosed') : undefined,
      onSelect: () => closeMutation.mutate(orderId),
    },
    {
      id: 'refuse',
      labelKey: 'closure.refuse',
      icon: Ban,
      group: 'final',
      opensModal: true,
      destructive: true,
      codes: [],
      anyOfCodes: closureKindAnyOfCodes('REFUSE'),
      disabled: isLocked,
      disabledReason: lockedReason,
      onSelect: () => setReasonKind('REFUSE'),
    },
    {
      id: 'cancel',
      labelKey: 'closure.cancel',
      icon: XCircle,
      group: 'final',
      opensModal: true,
      destructive: true,
      codes: [],
      anyOfCodes: closureKindAnyOfCodes('CANCEL'),
      disabled: isLocked,
      disabledReason: lockedReason,
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
  const hasNonFinalActions = visibleActions.some((action) => action.group !== 'final');

  const chooseAction = (action: RowAction) => {
    if (action.awaitsDetails === true) {
      setPartialRequested(true);
      return;
    }
    setSheetOpen(false);
    if (action.opensModal) {
      pendingActionRef.current = action.onSelect;
      return;
    }
    action.onSelect();
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) setPartialRequested(false);
  };

  const handleSheetCloseAutoFocus = (event: Event) => {
    const pending = pendingActionRef.current;
    if (!pending) return;
    event.preventDefault();
    pendingActionRef.current = null;
    triggerRef.current?.focus();
    pending();
  };

  const isBusy = isPending || partialRequested;

  const renderAction = (action: RowAction) => {
    const Icon = action.icon;
    const isDisabled = action.disabled || partialRequested || (isPending && action.survivesPending !== true);
    const reason = action.disabledReason ?? (isBusy ? t('inProcess.reason.pending') : undefined);
    const reasonId = `${idPrefix}-${action.id}-reason`;
    const showReason = isDisabled && reason !== undefined;

    return (
      <Button
        key={action.id}
        type="button"
        variant="ghost"
        className={cn(
          'h-auto w-full justify-start gap-3 py-3 text-sm',
          action.destructive && 'text-destructive hover:bg-destructive/10',
        )}
        disabled={isDisabled}
        loading={action.awaitsDetails === true && partialRequested}
        title={action.disabledReason}
        aria-describedby={showReason ? reasonId : undefined}
        onClick={() => chooseAction(action)}
      >
        <Icon className={cn('size-4', action.destructive ? 'text-destructive' : 'text-gray-600')} />
        <span className="flex flex-col items-start gap-0.5 text-start">
          <span>{t(action.labelKey)}</span>
          {showReason && (
            <span id={reasonId} className="text-xs text-gray-500 whitespace-normal">
              {reason}
            </span>
          )}
        </span>
      </Button>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {visibleActions.length > 0 && (
        <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button
              ref={triggerRef}
              type="button"
              variant="ghost"
              size="touch"
              className="size-11 sm:size-11"
              aria-label={t('inProcess.sheet.actionsFor', { code: orderCode })}
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
            <SheetHeader className="border-b p-4 text-start">
              <SheetTitle>{t('inProcess.sheet.title')}</SheetTitle>
              <SheetDescription>اختر الإجراء المطلوب لهذا الطلب</SheetDescription>
              <div className="flex flex-col gap-2 pt-2">
                <CopyableCode value={orderCode} label="نسخ كود الطلب">
                  <span className="font-mono font-medium text-gray-900">{orderCode}</span>
                </CopyableCode>
                <p className="text-sm text-gray-700">{customerName ?? '—'}</p>
                <ShipmentStatusBadge status={status} />
                {isInProcessRow && <LatenessChip model={latenessChipOf(lateness ?? null, t)} />}
                {closure !== null && (
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">{t(CLOSURE_KIND_LABEL_KEYS[closure.kind])}</span>
                    {closureReasonOf(closure) && (
                      <span className="text-gray-500"> - {closureReasonOf(closure)}</span>
                    )}
                  </p>
                )}
                {closure?.notes ? <p className="text-sm text-muted-foreground">{closure.notes}</p> : null}
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-2">
              {ACTION_GROUPS.map((group) => {
                const groupActions = visibleActions.filter((action) => action.group === group.id);
                if (groupActions.length === 0) return null;
                return (
                  <Fragment key={group.id}>
                    {group.id === 'final' && hasNonFinalActions && <Separator className="my-2" />}
                    <section className="flex flex-col gap-1">
                      <h3 className="px-3 pt-2 text-xs font-semibold text-gray-500">{t(group.titleKey)}</h3>
                      {groupActions.map(renderAction)}
                    </section>
                  </Fragment>
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
      {isLateMarkOpen && shippingCompanyId !== undefined && (
        <LateMarkModal
          shippingCompanyId={shippingCompanyId}
          orderId={orderId}
          lateness={lateness ?? null}
          onClose={() => setIsLateMarkOpen(false)}
        />
      )}
      {isWindowOpen && shippingCompanyId !== undefined && (
        <DeliveryWindowModal
          shippingCompanyId={shippingCompanyId}
          orderId={orderId}
          availableFrom={availableFrom ?? null}
          availableTo={availableTo ?? null}
          onClose={() => setIsWindowOpen(false)}
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
          carrierImplementation={carrierImplementation}
        />
      )}
    </div>
  );
}
