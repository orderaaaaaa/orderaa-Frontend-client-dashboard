import React, { useState, useEffect, useMemo } from 'react';
import { DerivedOrderKind, Order, FilterOrdersDto } from '@/types/orders';
import { useOrderStatusesQuery } from '@/services/orders';
import { useModalState } from '@/hooks/OrderDetails/useModalState';
import { useOrderActions } from '@/hooks/OrderDetails/useOrderActions';
import { useOrderFieldUpdate } from '@/hooks/OrderDetails/useOrderFieldUpdate';
import { useOrderNavigation } from '@/hooks/OrderDetails/useOrderNavigation';
import { useOrderStockAvailabilityQuery } from '@/services/warehouses';
import type { AvailabilityLine } from '@/lib/api/warehouses';
import { toast } from 'react-toastify';
import {
  formatAvailableStockLines,
  getApiErrorMessage,
  getOutOfStockBlock,
} from '@/utils/apiError';
import { AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE } from '@/lib/api/stockShortage';
import { availableRefusalLineOf } from '@/components/stock/variantAvailabilityModel';
import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import { CustomerDataSection } from './sections/CustomerDataSection';
import { PricingSection } from './sections/PricingSection';
import { ShippingSection } from './sections/ShippingSection';
import { PackagingNotesSection } from './sections/PackagingNotesSection';
import { OrderActionsFooter } from './actions/OrderActionsFooter';
import { useOrderActionAvailability } from './actions/useOrderActionAvailability';
import { orderMenuItemsOf } from './actions/orderMenuItems';
import { OrderActionModals } from './modals/OrderActionModals';
import { ErrorModal } from './modals/ErrorModal';
import { OrderActionsFooterLargeScreens } from './actions/ActionsDropdownLargeScreens';
import { PartialReturnLinks } from './PartialReturnLinks';
import { shippingCompanyNameOf } from '@/lib/shippingCompanies';
import {
  PARTIAL_DELIVERY_CODES,
  mustOpenSplitPopup,
  orderPagePartialActionOf,
  undoPartialDeliveryActionOf,
} from '@/utils/partialDelivery/partialDeliveryGate';
import { useI18n } from '@/i18n/I18nProvider';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { isDeletedOrder } from '@/utils/deletedOrder';

interface OrderDetailsInfoComponentProps {
  order: Order;
  onNavigateToNextOrder?: (nextOrderId: number) => void | Promise<void>;
  onNoOrdersFound?: () => void;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: string | null;
  navigationFilters?: FilterOrdersDto;
  onUnlock?: () => Promise<void>;
  isLockPending?: boolean;
  isLockedByOther?: boolean;
}

const ACTION_NOT_APPLIED = 'ACTION_NOT_APPLIED';

type SettledAvailabilityLine = AvailabilityLine & { available: number };

function OrderDetailsInfoComponent({
  order,
  onNavigateToNextOrder,
  onNoOrdersFound,
  dateRange,
  statusFilter,
  navigationFilters,
  onUnlock,
  isLockPending = false,
  isLockedByOther = false,
}: OrderDetailsInfoComponentProps) {
  const [deferredIntent, setDeferredIntent] = useState<(() => void) | null>(
    null
  );
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: '',
  });
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: '',
  });

  // Pending shipping-type change that requires returnShipmentContent.
  // When set (non-DELIVERY), the content editor appears under the shipping-type
  // selector in PricingSection and the type is NOT saved until the content is approved.
  const [pendingShippingType, setPendingShippingType] = useState<string | null>(null);

  const { data: statusesData, error: statusesError } = useOrderStatusesQuery();
  const { t } = useI18n();
  const { hasAllPermissions, hasPermission } = usePermissionCheck();
  // Permission-scoped on purpose — these become the status actions offered.
  const availableStatuses = statusesData?.statuses ?? [];

  useEffect(() => {
    if (statusesError) {
      toast.error('فشل في تحميل حالات الطلبات');
    }
  }, [statusesError]);

  const modals = useModalState([
    'urgent',
    'cancel',
    'stopOperation',
    'postponeHours',
    'postponeDays',
    'addColorProduct',
    'rejectModification',
    'waitingPayment',
    'whatsapp',
    'shipping',
    'packagingNotes',
    'confirmAction',
    'exchange',
    'returnRefund',
    'postShippingCancel',
    'partialDelivery',
    'undoPartialDelivery',
    'resend',
    'late',
  ]);

  const actions = useOrderActions({
    order,
    onNavigateToNextOrder,
    onNoOrdersFound,
    onUnlock,
    dateRange,
    statusFilter,
    navigationFilters,
    availableStatuses,
  });

  const navigation = useOrderNavigation({
    orderId: order.id,
    onNavigate: onNavigateToNextOrder,
    onNoOrdersFound,
    dateRange,
    statusFilter,
    navigationFilters,
  });

  const { updateField, updateFields } = useOrderFieldUpdate(order.id);

  const runWhenLockSettles = (intent: () => void) => {
    if (actions.isTransitioning) return;
    if (isLockPending) {
      setDeferredIntent(() => intent);
      return;
    }
    intent();
  };

  useEffect(() => {
    if (isLockPending || deferredIntent === null) return;
    setDeferredIntent(null);
    if (!isLockedByOther) {
      deferredIntent();
    }
  }, [isLockPending, isLockedByOther, deferredIntent]);

  const deleted = isDeletedOrder(order);
  const { data: stockAvailability } = useOrderStockAvailabilityQuery(
    deleted ? undefined : order.id
  );
  const stockWarning = useMemo(() => {
    const notSet =
      stockAvailability?.availableWarehouseSet === false &&
      stockAvailability.lines.length > 0;
    const settled = (stockAvailability?.lines ?? []).filter(
      (line): line is SettledAvailabilityLine => line.available !== null
    );
    const warehouseName = stockAvailability?.availableWarehouse?.name ?? '';
    const toRefusalLine = (line: SettledAvailabilityLine) =>
      availableRefusalLineOf(line.productName, line);
    const warned = notSet ? [] : settled.filter((line) => line.warning && !line.blocked);
    return warned.length > 0
      ? `${translate(readStoredLocale(), 'stockShortage.availableWarning', { warehouse: warehouseName })}\n${formatAvailableStockLines(warned.map(toRefusalLine))}`
      : undefined;
  }, [stockAvailability]);

  // Get the last event status from order events
  const lastEventStatus = useMemo(() => {
    if (!order.order_events || order.order_events.length === 0) {
      return undefined;
    }
    // Sort by createdAt descending and get the first (most recent) event
    const sortedEvents = [...order.order_events].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedEvents[0]?.name;
  }, [order.order_events]);

  const frozen = order.frozenReturnChild === true;
  const readOnly = frozen || deleted;
  const lineCount = order.order_products.length;
  const hasReturnChild = (order.partialReturns ?? []).some((item) => item.lineCount > 0);
  const hasActiveShippingId = order.shipping_ids?.some((row) => row.isActive) ?? false;
  const isCustomerReturn = order.derivedKind === DerivedOrderKind.CUSTOMER_RETURN;

  const partialGate = orderPagePartialActionOf({
    status: order.status,
    lineCount,
    hasReturnChild,
    frozen: readOnly,
    isCustomerReturn,
    carrierImplementation: order.shippingCompanyRef?.implementation,
    settlementAmount: order.settlementAmount ?? null,
    hasActiveShippingId,
  });
  const partialAction = {
    visible: partialGate.visible,
    blockedReason: partialGate.blockedKey === null ? null : t(partialGate.blockedKey),
  };

  const undoChild = (order.partialReturns ?? []).find((item) => item.lineCount > 0);
  const undoGate = undoPartialDeliveryActionOf({
    locked: false,
    status: order.status,
    hasReturnChild: undoChild !== undefined,
    childStatus: undoChild?.status ?? null,
  });
  const undoAction = {
    visible: undoGate.visible,
    blockedReason: undoGate.blockedKey === null ? null : t(undoGate.blockedKey),
  };

  const actionable = !order.isShadowed && !order.parkedAt;
  const availability = useOrderActionAvailability({
    status: order.status,
    isCustomerReturn,
    frozen,
    actionable,
    lastEventStatus,
    availableStatuses,
  });
  const partialDeliveryPermitted =
    actionable && hasPermission(PERMISSION_CODES.ORDERS_UPDATE) && hasAllPermissions(PARTIAL_DELIVERY_CODES);
  const menuItems = orderMenuItemsOf({
    availability,
    partialVisible: partialAction.visible && partialDeliveryPermitted,
    undoVisible: undoAction.visible && partialDeliveryPermitted,
  });

  const handleConfirmClick = () =>
    runWhenLockSettles(() =>
      setConfirmationDialog({
        isOpen: true,
        title: 'تأكيد الطلب',
        message: stockWarning
          ? `هل أنت متأكد من تأكيد هذا الطلب؟\n\n${stockWarning}`
          : 'هل أنت متأكد من تأكيد هذا الطلب؟',
        action: 'confirm',
      })
    );

  const handleFollowUpClick = (label: string, action: string) =>
    runWhenLockSettles(() =>
      setConfirmationDialog({
        isOpen: true,
        title: `تأكيد ${label}`,
        message: `هل أنت متأكد من ${label} لهذا الطلب؟`,
        action: action,
      })
    );

  const handleActionClick = (label: string, action: string) =>
    runWhenLockSettles(() => openAction(label, action));

  const openAction = (label: string, action: string) => {
    switch (action) {
      case 'urgent':
        modals.urgent.open();
        break;
      case 'cancel':
        modals.cancel.open();
        break;
      case 'stop_operation':
        modals.stopOperation.open();
        break;
      case 'reject_modification':
        modals.rejectModification.open();
        break;
      case 'postpone_hours':
        modals.postponeHours.open();
        break;
      case 'postpone_days':
        modals.postponeDays.open();
        break;
      case 'waiting_payment':
        modals.waitingPayment.open();
        break;
      case 'whatsapp':
        modals.whatsapp.open();
        break;
      case 'exchange':
        modals.exchange.open();
        break;
      case 'return_refund':
        modals.returnRefund.open();
        break;
      case 'cancel_post_shipping':
        modals.postShippingCancel.open();
        break;
      case 'partial_delivery':
        modals.partialDelivery.open();
        break;
      case 'undo_partial_delivery':
        modals.undoPartialDelivery.open();
        break;
      case 'resend':
        console.log('[Resend] action triggered for order:', order.id);
        break;
      case 'late':
        console.log('[Late] action triggered for order:', order.id);
        break;
      default:
        setConfirmationDialog({
          isOpen: true,
          title: `تأكيد ${label}`,
          message: `هل أنت متأكد من ${label} لهذا الطلب؟`,
          action,
        });
    }
  };

  const shippingLabel = shippingCompanyNameOf(order.shippingCompanyRef);

  const followUpActions = [
    'no_answer',
    'closed',
    'not_collecting',
    'open_close',
  ];

  const followUpActionLabels: Record<string, string> = {
    no_answer: 'لا يرد',
    closed: 'مغلق',
    not_collecting: 'مش بيجمع',
    open_close: 'فتح و قفل',
  };

  const handleConfirmAction = async () => {
    const action = confirmationDialog.action;
    let succeeded = false;

    try {
      if (followUpActions.includes(action)) {
        const label = followUpActionLabels[action] || action;
        succeeded = await actions.handleFollowUpAction(label);
      } else {
        succeeded = await actions.handleConfirmAction(action);
      }
    } catch (error: unknown) {
      const block = getOutOfStockBlock(error);
      setErrorModal({
        isOpen: true,
        message:
          block?.code === AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE
            ? block.message
            : getApiErrorMessage(
                error,
                (error instanceof Error && error.message) ||
                  'فشل في تحديث الطلب. يرجى المحاولة مرة أخرى.'
              ),
      });
    }

    if (!succeeded) {
      throw new Error(ACTION_NOT_APPLIED);
    }
  };

  // User picked a shipping type. DELIVERY saves immediately (backend clears
  // returnShipmentContent). Any other type is staged pending until the
  // returnShipmentContent is approved — this avoids the backend 400 that would
  // otherwise leave the UI stuck (type changed but field never shown).
  const handleShippingTypeSelect = (value: string) => {
    if (value === 'DELIVERY') {
      setPendingShippingType(null);
      updateField('shippingType', value);
      return;
    }
    if (
      mustOpenSplitPopup({
        requestedType: value,
        currentType: order.shippingType,
        carrierImplementation: order.shippingCompanyRef?.implementation,
        hasActiveShippingId,
        status: order.status,
        lineCount,
        hasReturnChild,
        isCustomerReturn,
      })
    ) {
      if (!hasAllPermissions(PARTIAL_DELIVERY_CODES)) {
        toast.error(t('partialDelivery.edit.noPermission'));
        return;
      }
      setPendingShippingType(null);
      runWhenLockSettles(() => modals.partialDelivery.open());
      return;
    }
    setPendingShippingType(value);
  };

  // Save returnShipmentContent + pending shippingType in a SINGLE PATCH.
  // Two sequential PATCHes fail because the second (shippingType alone) triggers
  // backend validation: !returnShipmentContent → 400.
  // When there's no pending type (order already has non-DELIVERY), just save content.
  const handleSaveReturnContent = async (content: string) => {
    if (pendingShippingType && pendingShippingType !== 'DELIVERY') {
      await updateFields({
        shippingType: pendingShippingType,
        returnShipmentContent: content.trim(),
      });
    } else {
      // Order already has non-DELIVERY type, just update content directly
      await updateField('returnShipmentContent', content.trim());
    }
    setPendingShippingType(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 font-medium p-4 bg-gray-50 mt-8 rounded-xl md:mb-24 w-full max-w-full">
        <PartialReturnLinks order={order} />

        <CustomerDataSection
          order={order}
          onUpdate={updateField}
          readOnly={readOnly}
        />

        <PricingSection
          order={order}
          onUpdate={updateField}
          onShippingTypeSelect={handleShippingTypeSelect}
          pendingShippingType={pendingShippingType}
          onSaveReturnContent={handleSaveReturnContent}
          isCustomerReturn={isCustomerReturn}
          readOnly={readOnly}
        />

        <ShippingSection
          shippingCompanyName={shippingLabel}
          governorate={order.governorate}
          city={order.city}
          address={order.address}
          onEditClick={readOnly ? undefined : modals.shipping.open}
          externalGovernorate={order.externalGovernorate}
          externalCity={order.externalCity}
          sourceGovernorate={order.sourceGovernorate}
          sourceCity={order.sourceCity}
        />

        <PackagingNotesSection
          packagingNotes={order.packagingNotes}
          onAddClick={readOnly ? undefined : modals.packagingNotes.open}
        />
      </div>

      {!deleted && <div className="md:hidden">
        <OrderActionsFooter
          availability={availability}
          menuItems={menuItems}
          onConfirm={handleConfirmClick}
          onFollowUpClick={handleFollowUpClick}
          onActionClick={handleActionClick}
          onNavigateNext={navigation.navigateToNext}
          onNavigatePrevious={navigation.navigateToPrevious}
          isNavigatingNext={navigation.isNavigatingNext}
          isNavigatingPrevious={navigation.isNavigatingPrevious}
          isBusy={actions.isTransitioning}
          partialAction={partialAction}
          undoAction={undoAction}
        />
      </div>}

      {!deleted && <div className="hidden md:block">
        <OrderActionsFooterLargeScreens
          availability={availability}
          menuItems={menuItems}
          onConfirm={handleConfirmClick}
          onFollowUpClick={handleFollowUpClick}
          onActionClick={handleActionClick}
          onNavigateNext={navigation.navigateToNext}
          onNavigatePrevious={navigation.navigateToPrevious}
          isNavigatingNext={navigation.isNavigatingNext}
          isNavigatingPrevious={navigation.isNavigatingPrevious}
          isBusy={actions.isTransitioning}
          partialAction={partialAction}
          undoAction={undoAction}
        />
      </div>}

      {!deleted && <OrderActionModals
        modals={modals}
        order={order}
        actions={actions}
        confirmationDialog={confirmationDialog}
        onCloseConfirmation={() =>
          setConfirmationDialog({
            isOpen: false,
            title: '',
            message: '',
            action: '',
          })
        }
        onConfirmAction={handleConfirmAction}
        onError={(message) => setErrorModal({ isOpen: true, message })}
      />}

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="فشل"
        message={errorModal.message}
      />
    </>
  );
}

export default OrderDetailsInfoComponent;
