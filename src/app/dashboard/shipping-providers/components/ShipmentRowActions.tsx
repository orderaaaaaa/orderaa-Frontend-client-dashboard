'use client';

import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Ban,
  BadgeDollarSign,
  CalendarX,
  Clock,
  Flag,
  History,
  Info,
  MapPin,
  MessageSquareText,
  PackageCheck,
  PackageSearch,
  Phone,
  RotateCcw,
  Send,
  Truck,
  Undo2,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { LiaEllipsisVSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import ChangeProductsModal from '@/components/orders/ChangeProductsModal';
import PartialDeliveryModal from '@/components/OrderDetails/ActionModals/PartialDeliveryModal';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import CopyableCode from '@/components/ui/copyable-code';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { closureKindAnyOfCodes } from '@/lib/followupClosurePermissions';
import { PERMISSIONS, type PermissionCode } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { orderDetailsQueryOptions } from '@/services/orders';
import { KEY as SHIPPING_PROVIDERS_KEY, useCloseClosure, useUndoClosure } from '@/services/shippingProviders';
import { getApiErrorMessage } from '@/utils/apiError';
import { PARTIAL_DELIVERY_CODES } from '@/utils/partialDelivery/partialDeliveryGate';
import type { FollowupClosure, FollowupClosureKind } from '@/types/logistics';
import type { OrderStatus } from '@/types/orders';
import type { LatenessInfo, SendAgainBlockedReason, ShipmentRowBase } from '@/types/shippingProviders';
import { CARRIER_UPDATE_NOT_SUPPORTED_MESSAGE, type ShippingImplementation } from '@/types/shippingCompanies';
import { ClosureReasonModal, type ClosureReasonKind } from './ClosureReasonModal';
import { DeliveryWindowModal } from './DeliveryWindowModal';
import { ExchangeCandidatesModal } from './ExchangeCandidatesModal';
import { LatenessChip, latenessChipOf } from './LatenessChip';
import { LateMarkModal } from './LateMarkModal';
import { OrderEditModal, type OrderEditKind } from './OrderEditModals';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';
import { useSendAgainAction } from './SendAgainAction';

type ActionGroupId = 'follow' | 'delivery' | 'orderEdit' | 'closure' | 'final';

type ConfirmKind = 'close' | 'reopen';

interface RowAction {
  id: string;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
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
  reasonTone?: 'warning';
  pending?: boolean;
  onSelect: () => void;
}

export interface PartialDeliveryAccess {
  blockedReason: string | null;
  pending: boolean;
}

const ADDRESS_LOCATIONS_REASON = 'تحتاج صلاحية عرض المحافظات والمدن';

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
  { id: 'orderEdit', titleKey: 'inProcess.sheet.group.orderEdit' },
  { id: 'closure', titleKey: 'inProcess.sheet.group.closure' },
  { id: 'final', titleKey: 'inProcess.sheet.group.final' },
];

export interface ExchangeCarrierAccess {
  pending: boolean;
  supported: boolean | undefined;
}

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
  sendAgain?: { eligible: boolean; blockedReason: SendAgainBlockedReason | null };
  carrierResendSupported?: boolean;
  exchangeCarrier?: ExchangeCarrierAccess;
  editRow?: ShipmentRowBase;
  carrierSupportsUpdate?: boolean;
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
  sendAgain,
  carrierResendSupported,
  exchangeCarrier,
  editRow,
  carrierSupportsUpdate,
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
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null);
  const [isLateMarkOpen, setIsLateMarkOpen] = useState(false);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [editKind, setEditKind] = useState<OrderEditKind | null>(null);
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
  const exchangeUnavailableReason = exchangeCarrier?.pending
    ? t('inProcess.reason.loadingCarrier')
    : exchangeCarrier?.supported === true
      ? undefined
      : exchangeCarrier?.supported === false
        ? t('inProcess.reason.exchangeUnsupported')
        : t('inProcess.reason.exchangeCarrierMissing');
  const sendAgainAction = useSendAgainAction({
    orderId,
    eligible: sendAgain?.eligible ?? false,
    blockedReason: sendAgain?.blockedReason ?? null,
    closure,
    resendSupported: carrierResendSupported,
  });

  const canReadLocations = hasAllPermissions([PERMISSIONS.SHIPPING_LOCATIONS_READ]);
  const actions: RowAction[] = [
    ...(onOpenNotes
      ? [
          {
            id: 'notes',
            labelKey: 'inProcess.action.notes' as const,
            descriptionKey: 'inProcess.sheet.desc.notes' as const,
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
            descriptionKey: 'inProcess.sheet.desc.log' as const,
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
            descriptionKey: 'inProcess.sheet.desc.late' as const,
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
            descriptionKey: 'inProcess.sheet.desc.deliveryWindow' as const,
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
            descriptionKey: 'inProcess.sheet.desc.partial' as const,
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
    ...(editRow !== undefined
      ? [
          {
            id: 'editAddress',
            labelKey: 'inProcess.action.address' as const,
            descriptionKey: 'inProcess.sheet.desc.address' as const,
            icon: MapPin,
            group: 'orderEdit' as const,
            opensModal: true,
            codes: [PERMISSIONS.FOLLOWUP_CARRIERS_EDIT_MANAGE],
            disabled: rowLocked || !canReadLocations,
            disabledReason: rowLockedReason ?? (canReadLocations ? undefined : ADDRESS_LOCATIONS_REASON),
            onSelect: () => setEditKind('address'),
          },
          {
            id: 'editPrice',
            labelKey: 'inProcess.action.price' as const,
            descriptionKey: 'inProcess.sheet.desc.price' as const,
            icon: BadgeDollarSign,
            group: 'orderEdit' as const,
            opensModal: true,
            codes: [PERMISSIONS.FOLLOWUP_CARRIERS_EDIT_MANAGE],
            disabled: rowLocked || carrierSupportsUpdate === false,
            disabledReason:
              rowLockedReason ?? (carrierSupportsUpdate === false ? CARRIER_UPDATE_NOT_SUPPORTED_MESSAGE : undefined),
            onSelect: () => setEditKind('price'),
          },
          {
            id: 'editReturnCost',
            labelKey: 'inProcess.action.returnCost' as const,
            descriptionKey: 'inProcess.sheet.desc.returnCost' as const,
            icon: Undo2,
            group: 'orderEdit' as const,
            opensModal: true,
            codes: [PERMISSIONS.FOLLOWUP_CARRIERS_EDIT_MANAGE],
            disabled: rowLocked || carrierSupportsUpdate === false,
            disabledReason:
              rowLockedReason ?? (carrierSupportsUpdate === false ? CARRIER_UPDATE_NOT_SUPPORTED_MESSAGE : undefined),
            onSelect: () => setEditKind('returnCost'),
          },
          {
            id: 'editPhone',
            labelKey: 'inProcess.action.addPhone' as const,
            descriptionKey: 'inProcess.sheet.desc.addPhone' as const,
            icon: Phone,
            group: 'orderEdit' as const,
            opensModal: true,
            codes: [PERMISSIONS.FOLLOWUP_CARRIERS_EDIT_MANAGE],
            disabled: rowLocked,
            disabledReason: rowLockedReason,
            onSelect: () => setEditKind('phone'),
          },
        ]
      : []),
    ...(isInProcessRow
      ? [
          {
            id: 'changeProducts',
            labelKey: 'closure.changeProducts' as const,
            descriptionKey: 'inProcess.sheet.desc.changeProducts' as const,
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
            descriptionKey: 'inProcess.sheet.desc.exchange' as const,
            icon: ArrowLeftRight,
            group: 'delivery' as const,
            opensModal: true,
            codes: [PERMISSIONS.FOLLOWUP_READ],
            disabled: isLocked || rowLocked || exchangeUnavailableReason !== undefined,
            disabledReason: lockedReason ?? rowLockedReason ?? exchangeUnavailableReason,
            reasonTone: 'warning' as const,
            onSelect: () => setIsExchangeOpen(true),
          },
        ]
      : []),
    ...(sendAgain !== undefined
      ? [
          {
            id: 'sendAgain',
            labelKey: 'inProcess.action.sendAgain' as const,
            descriptionKey: 'inProcess.sheet.desc.sendAgain' as const,
            icon: Send,
            group: 'delivery' as const,
            opensModal: true,
            pending: sendAgainAction.isPending,
            codes: [PERMISSIONS.FOLLOWUP_MANAGE],
            disabled: sendAgainAction.isDisabled || sendAgainAction.isPending,
            disabledReason:
              sendAgainAction.blockedKey !== undefined ? t(sendAgainAction.blockedKey) : undefined,
            onSelect: sendAgainAction.open,
          },
        ]
      : []),
    {
      id: 'close',
      labelKey: 'closure.close',
      descriptionKey: 'inProcess.sheet.desc.close',
      icon: CalendarX,
      group: 'closure',
      opensModal: true,
      codes: [],
      anyOfCodes: closureKindAnyOfCodes('CLOSED_TODAY'),
      disabled: closure !== null,
      disabledReason: closure !== null ? t('inProcess.reason.alreadyClosed') : undefined,
      onSelect: () => setConfirmKind('close'),
    },
    {
      id: 'refuse',
      labelKey: 'closure.refuse',
      descriptionKey: 'inProcess.sheet.desc.refuse',
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
      descriptionKey: 'inProcess.sheet.desc.cancel',
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
      descriptionKey: 'inProcess.sheet.desc.reopen',
      icon: RotateCcw,
      group: 'closure',
      opensModal: true,
      codes: [],
      anyOfCodes: closureKindAnyOfCodes(closure.kind),
      disabled: false,
      onSelect: () => setConfirmKind('reopen'),
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
          'h-auto min-h-12 w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:h-auto sm:py-2.5',
          action.destructive && 'hover:bg-destructive/10',
        )}
        disabled={isDisabled}
        loading={(action.awaitsDetails === true && partialRequested) || action.pending === true}
        title={action.disabledReason}
        aria-describedby={showReason ? reasonId : undefined}
        onClick={() => chooseAction(action)}
      >
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md bg-muted',
            action.destructive && 'bg-destructive/10',
          )}
        >
          <Icon className={cn('size-4', action.destructive ? 'text-destructive' : 'text-muted-foreground')} />
        </span>
        <span className="flex min-w-0 flex-col items-start gap-1 text-start">
          <span className={cn('font-medium', action.destructive ? 'text-destructive' : 'text-foreground')}>
            {t(action.labelKey)}
          </span>
          {!(showReason && action.reasonTone === 'warning') && (
            <span className="text-xs whitespace-normal text-muted-foreground">{t(action.descriptionKey)}</span>
          )}
          {showReason && (
            <span
              id={reasonId}
              className={cn(
                'mt-0.5 text-xs whitespace-normal',
                action.reasonTone === 'warning'
                  ? 'flex items-center gap-1.5 font-medium text-amber-900 dark:text-amber-200'
                  : 'text-muted-foreground',
              )}
            >
              {action.reasonTone === 'warning' && <Info className="size-3.5 shrink-0" />}
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
              <LiaEllipsisVSolid className="size-5 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full gap-0 p-0 sm:max-w-md data-[state=open]:duration-300 data-[state=closed]:duration-200"
            onCloseAutoFocus={handleSheetCloseAutoFocus}
          >
            <SheetHeader className="gap-3 border-b p-4 pe-12 text-start">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Truck className="size-5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{t('inProcess.sheet.title')}</span>
                  <SheetTitle className="text-lg">
                    <CopyableCode value={orderCode} label={t('inProcess.sheet.copyCode')}>
                      <span dir="ltr" className="font-mono font-semibold text-foreground">
                        {orderCode}
                      </span>
                    </CopyableCode>
                  </SheetTitle>
                  <p className="truncate text-sm text-muted-foreground">{customerName ?? '—'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ShipmentStatusBadge status={status} />
                {isInProcessRow && <LatenessChip model={latenessChipOf(lateness ?? null, t)} />}
              </div>
              {closure !== null && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{t(CLOSURE_KIND_LABEL_KEYS[closure.kind])}</span>
                  {closureReasonOf(closure) && <span> - {closureReasonOf(closure)}</span>}
                </p>
              )}
              {closure?.notes ? <p className="text-sm text-muted-foreground">{closure.notes}</p> : null}
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              <SheetDescription className="px-3 pt-3 pb-1">{t('inProcess.sheet.pickAction')}</SheetDescription>
              {ACTION_GROUPS.map((group) => {
                const groupActions = visibleActions.filter((action) => action.group === group.id);
                if (groupActions.length === 0) return null;
                return (
                  <Fragment key={group.id}>
                    {group.id === 'final' && hasNonFinalActions && <Separator className="my-2" />}
                    <section className="flex flex-col gap-1">
                      <h3 className="px-3 pt-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {t(group.titleKey)}
                      </h3>
                      {groupActions.map(renderAction)}
                    </section>
                  </Fragment>
                );
              })}
            </div>
            <SheetFooter className="border-t p-4">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="w-full">
                  {t('inProcess.sheet.close')}
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
      {sendAgainAction.modal}
      {reasonKind !== null && (
        <ClosureReasonModal
          kind={reasonKind}
          orderId={orderId}
          onClose={() => setReasonKind(null)}
        />
      )}
      {isExchangeOpen && (
        <ExchangeCandidatesModal isOpen onClose={() => setIsExchangeOpen(false)} orderId={orderId} />
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
      {confirmKind !== null && (
        <BaseModal
          isOpen
          onClose={() => setConfirmKind(null)}
          title={t(
            confirmKind === 'close' ? 'inProcess.confirm.closeTitle' : 'inProcess.confirm.reopenTitle',
            { code: orderCode },
          )}
          onConfirm={() => {
            const mutation = confirmKind === 'close' ? closeMutation : undoMutation;
            mutation.mutate(orderId, { onSuccess: () => setConfirmKind(null) });
          }}
          confirmText={t('inProcess.confirm.confirm')}
          cancelText={t('inProcess.confirm.cancel')}
          isLoading={isPending}
          maxWidth="md:max-w-sm"
        >
          {null}
        </BaseModal>
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
      {editKind !== null && editRow !== undefined && shippingCompanyId !== undefined && (
        <OrderEditModal
          kind={editKind}
          orderId={orderId}
          shippingCompanyId={shippingCompanyId}
          row={editRow}
          carrierSupportsUpdate={carrierSupportsUpdate}
          onClose={() => setEditKind(null)}
        />
      )}
      {isPartialOpen && orderQuery.data && (
        <PartialDeliveryModal
          isOpen
          onClose={() => setIsPartialOpen(false)}
          orderId={orderId}
          orderProducts={orderQuery.data.order_products}
          totalCost={orderQuery.data.totalCost}
          carrierImplementation={carrierImplementation}
        />
      )}
    </div>
  );
}
