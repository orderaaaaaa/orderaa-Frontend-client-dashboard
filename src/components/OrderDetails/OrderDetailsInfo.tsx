import React, { useState, useEffect, useMemo } from 'react';
import { Order, FilterOrdersDto } from '@/types/orders';
import { useOrderStatusesQuery } from '@/services/orders';
import { useModalState } from '@/hooks/OrderDetails/useModalState';
import { useOrderActions } from '@/hooks/OrderDetails/useOrderActions';
import { useOrderFieldUpdate } from '@/hooks/OrderDetails/useOrderFieldUpdate';
import { useOrderNavigation } from '@/hooks/OrderDetails/useOrderNavigation';
import { useOrderStockAvailabilityQuery } from '@/services/warehouses';
import { toast } from 'react-toastify';
import { formatStockShortageLines, getApiErrorMessage } from '@/utils/apiError';
import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import { CustomerDataSection } from './sections/CustomerDataSection';
import { PricingSection } from './sections/PricingSection';
import { ShippingSection } from './sections/ShippingSection';
import { PackagingNotesSection } from './sections/PackagingNotesSection';
import { OrderActionsFooter } from './actions/OrderActionsFooter';
import { OrderActionModals } from './modals/OrderActionModals';
import { ErrorModal } from './modals/ErrorModal';
import { OrderActionsFooterLargeScreens } from './actions/ActionsDropdownLargeScreens';
import { PartialReturnLinks } from './PartialReturnLinks';
import { shippingCompanyNameOf } from '@/lib/shippingCompanies';

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
    'partialDelivery',
    'exchange',
    'returnRefund',
    'postShippingCancel',
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

  /**
   * T27 — the out-of-stock confirmation gate, mirrored into the UI.
   *
   * Disabling the button is a courtesy so the agent sees the problem before
   * clicking; the server refuses independently with a 409, because stock can
   * change between this render and the click. Never rely on the disabled state.
   */
  const { data: stockAvailability } = useOrderStockAvailabilityQuery(
    order.id
  );
  const stockGate = useMemo(() => {
    // Undefined while loading — do NOT block on that, or the confirm button is
    // dead on every first paint.
    if (!stockAvailability || stockAvailability.canConfirm) {
      return { canConfirm: true, reason: undefined as string | undefined };
    }
    const blocking = stockAvailability.lines.filter((line) => line.blocked);
    return {
      canConfirm: false,
      reason: `${translate(readStoredLocale(), 'stockShortage.confirmBlocked')}\n${formatStockShortageLines(blocking)}`,
    };
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

  const handleConfirmClick = () =>
    runWhenLockSettles(() =>
      setConfirmationDialog({
        isOpen: true,
        title: 'تأكيد الطلب',
        message: 'هل أنت متأكد من تأكيد هذا الطلب؟',
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
      case 'partial_delivery':
        modals.partialDelivery.open();
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
      setErrorModal({
        isOpen: true,
        message: getApiErrorMessage(
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
      <div className="flex flex-col gap-4 font-medium p-4 bg-gray-50 mt-8 rounded-xl mb-24 w-full max-w-full">
        <PartialReturnLinks order={order} />

        <CustomerDataSection
          order={order}
          onUpdate={updateField}
        />

        <PricingSection
          order={order}
          onUpdate={updateField}
          onShippingTypeSelect={handleShippingTypeSelect}
          pendingShippingType={pendingShippingType}
          onSaveReturnContent={handleSaveReturnContent}
        />

        <ShippingSection
          shippingCompanyName={shippingLabel}
          governorate={order.governorate}
          city={order.city}
          address={order.address}
          onEditClick={modals.shipping.open}
          externalGovernorate={order.externalGovernorate}
          externalCity={order.externalCity}
          sourceGovernorate={order.sourceGovernorate}
          sourceCity={order.sourceCity}
        />

        <PackagingNotesSection
          packagingNotes={order.packagingNotes}
          onAddClick={modals.packagingNotes.open}
        />
      </div>

      <div className="md:hidden">
        <OrderActionsFooter
          orderStatus={order.status}
          lastEventStatus={lastEventStatus}
          onConfirm={handleConfirmClick}
          onFollowUpClick={handleFollowUpClick}
          onActionClick={handleActionClick}
          onNavigateNext={navigation.navigateToNext}
          onNavigatePrevious={navigation.navigateToPrevious}
          isNavigatingNext={navigation.isNavigatingNext}
          isNavigatingPrevious={navigation.isNavigatingPrevious}
          canConfirmStock={stockGate.canConfirm}
          stockBlockReason={stockGate.reason}
          isBusy={actions.isTransitioning}
        />
      </div>

      <div className="hidden md:block">
        <OrderActionsFooterLargeScreens
          orderStatus={order.status}
          lastEventStatus={lastEventStatus}
          onConfirm={handleConfirmClick}
          onFollowUpClick={handleFollowUpClick}
          onActionClick={handleActionClick}
          onNavigateNext={navigation.navigateToNext}
          onNavigatePrevious={navigation.navigateToPrevious}
          isNavigatingNext={navigation.isNavigatingNext}
          isNavigatingPrevious={navigation.isNavigatingPrevious}
          canConfirmStock={stockGate.canConfirm}
          stockBlockReason={stockGate.reason}
          isBusy={actions.isTransitioning}
        />
      </div>

      <OrderActionModals
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
      />

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
