import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, OrderStatusItem } from '@/types/orders';
import { useOrderStatusesQuery } from '@/services/orders';
import { useModalState } from '@/hooks/OrderDetails/useModalState';
import { useOrderActions } from '@/hooks/OrderDetails/useOrderActions';
import { useOrderFieldUpdate } from '@/hooks/OrderDetails/useOrderFieldUpdate';
import { useOrderNavigation } from '@/hooks/OrderDetails/useOrderNavigation';
import { toast } from 'react-toastify';
import { CustomerDataSection } from './sections/CustomerDataSection';
import { PricingSection } from './sections/PricingSection';
import { ShippingSection } from './sections/ShippingSection';
import { PackagingNotesSection } from './sections/PackagingNotesSection';
import { OrderActionsFooter } from './actions/OrderActionsFooter';
import { OrderActionModals } from './modals/OrderActionModals';
import { ErrorModal } from './modals/ErrorModal';

interface OrderDetailsInfoComponentProps {
  order: Order;
  onCustomerUpdate?: (updatedOrder: Order) => void;
  onOrderUpdate?: (updatedOrder: Order) => void;
  onNavigateToNextOrder?: (nextOrderId: number) => void;
  onNoOrdersFound?: () => void;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: string | null;
  isLockedByOther?: boolean;
  onUnlock?: () => Promise<void>;
}

function OrderDetailsInfoComponent({
  order,
  onCustomerUpdate,
  onOrderUpdate,
  onNavigateToNextOrder,
  onNoOrdersFound,
  dateRange,
  statusFilter,
  isLockedByOther,
  onUnlock,
}: OrderDetailsInfoComponentProps) {
  const [localOrder, setLocalOrder] = useState(order);
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

  const { data: statusesData, error: statusesError } = useOrderStatusesQuery();
  const availableStatuses = statusesData ?? [];

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
    'shipping',
    'packagingNotes',
    'confirmAction',
    'whatsappFollowup',
  ]);

  const handleUpdate = (updatedOrder: Order) => {
    setLocalOrder(updatedOrder);
    if (onOrderUpdate) {
      onOrderUpdate(updatedOrder);
    }
    if (onCustomerUpdate) {
      onCustomerUpdate(updatedOrder);
    }
  };

  const actions = useOrderActions({
    order: localOrder,
    onOrderUpdate: handleUpdate,
    onNavigateToNextOrder,
    onNoOrdersFound,
    dateRange,
    statusFilter,
    availableStatuses,
  });

  const navigation = useOrderNavigation({
    orderId: order.id,
    onNavigate: onNavigateToNextOrder,
    onNoOrdersFound,
    dateRange,
    statusFilter,
  });

  const updateField = useOrderFieldUpdate(localOrder.id, handleUpdate);

  // Get the last event status from order events
  const lastEventStatus = useMemo(() => {
    if (!localOrder.order_events || localOrder.order_events.length === 0) {
      return undefined;
    }
    // Sort by createdAt descending and get the first (most recent) event
    const sortedEvents = [...localOrder.order_events].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedEvents[0]?.status;
  }, [localOrder.order_events]);

  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  const handleConfirmClick = () => {
    setConfirmationDialog({
      isOpen: true,
      title: 'تأكيد الطلب',
      message: 'هل أنت متأكد من تأكيد هذا الطلب؟',
      action: 'confirm',
    });
  };

  const handleFollowUpClick = (label: string, action: string) => {
    setConfirmationDialog({
      isOpen: true,
      title: `تأكيد ${label}`,
      message: `هل أنت متأكد من ${label} لهذا الطلب؟`,
      action: action,
    });
  };

  const handleActionClick = (
    label: string,
    action: string,
    hasSubOptions?: boolean
  ) => {
    if (hasSubOptions) {
      return;
    }

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
      default:
        setConfirmationDialog({
          isOpen: true,
          title: `تأكيد ${label}`,
          message: `هل أنت متأكد من ${label} لهذا الطلب؟`,
          action,
        });
    }
  };

  const shippingLabel = useMemo(() => {
    switch (localOrder.shippingCompany) {
      case 'TURBO':
        return 'تربو';
      default:
        return localOrder.shippingCompany ?? '';
    }
  }, [localOrder.shippingCompany]);

  const handleWhatsappSubOptionClick = (action: string, label: string) => {
    if (
      action === 'send_professional_color' ||
      action === 'send_natural_color'
    ) {
      modals.addColorProduct.open();
    } else {
      setConfirmationDialog({
        isOpen: true,
        title: `تأكيد ${label}`,
        message: `هل أنت متأكد من ${label} للعميل عبر واتساب؟`,
        action: action,
      });
    }
  };

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

    try {
      if (followUpActions.includes(action)) {
        const label = followUpActionLabels[action] || action;
        await actions.handleFollowUpAction(label);
      } else {
        await actions.handleConfirmAction(action);
      }
      if (onUnlock) {
        await onUnlock();
      }
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        message:
          error?.message || 'فشل في تحديث الطلب. يرجى المحاولة مرة أخرى.',
      });
    }
  };

  const handlePhoneUpdate = (phoneNumbers: string[]) => {
    const updatedOrder = {
      ...localOrder,
      customers: {
        ...localOrder.customers,
        phone_numbers: phoneNumbers,
      },
    };
    handleUpdate(updatedOrder);
  };

  console.log(localOrder);

  return (
    <>
      <div className="flex flex-col gap-4 font-medium p-4 bg-gray-50 mt-8 rounded-xl mb-24 w-full max-w-full">
        <CustomerDataSection
          order={localOrder}
          onUpdate={updateField}
          onPhoneUpdate={handlePhoneUpdate}
        />

        <PricingSection order={localOrder} onUpdate={updateField} />

        <ShippingSection
          shippingCompany={shippingLabel}
          governorate={localOrder.governorate}
          city={localOrder.city}
          address={localOrder.address}
          onEditClick={modals.shipping.open}
          externalGovernorate={localOrder.externalGovernorate}
        />

        <PackagingNotesSection
          packagingNotes={localOrder.packagingNotes}
          onAddClick={modals.packagingNotes.open}
        />
      </div>

      <OrderActionsFooter
        orderStatus={localOrder.status}
        lastEventStatus={lastEventStatus}
        onConfirm={handleConfirmClick}
        onFollowUpClick={handleFollowUpClick}
        onActionClick={handleActionClick}
        onWhatsappSubOptionClick={handleWhatsappSubOptionClick}
        onNavigateNext={navigation.navigateToNext}
        onNavigatePrevious={navigation.navigateToPrevious}
        isNavigatingNext={navigation.isNavigatingNext}
        isNavigatingPrevious={navigation.isNavigatingPrevious}
        isLockedByOther={isLockedByOther}
      />

      <OrderActionModals
        modals={modals}
        order={localOrder}
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
