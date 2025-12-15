import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, OrderStatusItem } from '@/types/orders';
import { getOrderStatuses } from '@/lib/api/order';
import { useModalState } from '@/hooks/OrderDetails/useModalState';
import { useOrderActions } from '@/hooks/OrderDetails/useOrderActions';
import { useOrderFieldUpdate } from '@/hooks/OrderDetails/useOrderFieldUpdate';
import { toast } from 'react-toastify';
import { CustomerDataSection } from './sections/CustomerDataSection';
import { PricingSection } from './sections/PricingSection';
import { ShippingSection } from './sections/ShippingSection';
import { PackagingNotesSection } from './sections/PackagingNotesSection';
import { OrderActionsFooter } from './actions/OrderActionsFooter';
import { OrderActionModals } from './modals/OrderActionModals';

interface OrderDetailsInfoComponentProps {
  order: Order;
  onCustomerUpdate?: (updatedOrder: Order) => void;
  onOrderUpdate?: (updatedOrder: Order) => void;
  onNavigateToNextOrder?: (nextOrderId: number) => void;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: OrderStatus | null;
}

function OrderDetailsInfoComponent({
  order,
  onCustomerUpdate,
  onOrderUpdate,
  onNavigateToNextOrder,
  dateRange,
  statusFilter,
}: OrderDetailsInfoComponentProps) {
  // Local state
  const [localOrder, setLocalOrder] = useState(order);
  const [availableStatuses, setAvailableStatuses] = useState<OrderStatusItem[]>([]);
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

  // Custom Hooks
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
    dateRange,
    statusFilter,
    availableStatuses,
  });

  const updateField = useOrderFieldUpdate(localOrder.id, handleUpdate);

  // Fetch available statuses from API
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await getOrderStatuses();
        setAvailableStatuses(response.statuses);
      } catch (error) {
        console.error('Failed to fetch order statuses:', error);
        toast.error('فشل في تحميل حالات الطلبات');
      }
    };

    fetchStatuses();
  }, []);

  // Update local order when prop changes
  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  // Handlers
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

  const handleActionClick = (label: string, action: string, hasSubOptions?: boolean) => {
    // If it has sub-options (WhatsApp), ignore the click
    if (hasSubOptions) {
      return;
    }

    // Handle different actions
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
        // Fallback to old confirmation dialog
        setConfirmationDialog({
          isOpen: true,
          title: `تأكيد ${label}`,
          message: `هل أنت متأكد من ${label} لهذا الطلب؟`,
          action,
        });
    }
  };

  const handleWhatsappSubOptionClick = (action: string, label: string) => {
    // Handle color image requests - open color selection modal
    if (action === 'send_professional_color' || action === 'send_natural_color') {
      modals.addColorProduct.open();
    } else {
      // For all other WhatsApp options, open confirmation dialog
      setConfirmationDialog({
        isOpen: true,
        title: `تأكيد ${label}`,
        message: `هل أنت متأكد من ${label} للعميل عبر واتساب؟`,
        action: action,
      });
    }
  };

  const handleConfirmAction = async () => {
    const success = await actions.handleConfirmAction(confirmationDialog.action);
    if (!success) {
      throw new Error('Failed to update order status');
    }
  };

  const handlePhoneUpdate = (phoneNumber: string, altPhone?: string) => {
    const updatedOrder = {
      ...localOrder,
      customers: {
        ...localOrder.customers,
        phoneNumber,
        altPhone,
      },
    };
    handleUpdate(updatedOrder);
  };

  return (
    <>
      <div className="flex flex-col gap-4 font-medium p-4 bg-gray-50 mt-8 rounded-xl mb-24 overflow-hidden w-full max-w-full">
        <CustomerDataSection
          order={localOrder}
          onUpdate={updateField}
          onPhoneUpdate={handlePhoneUpdate}
        />

        <PricingSection order={localOrder} onUpdate={updateField} />

        <ShippingSection
          shippingCompany={localOrder.shippingCompany}
          governorate={localOrder.customers.governorate}
          city={localOrder.customers.city}
          address={localOrder.customers.address}
          onEditClick={modals.shipping.open}
        />

        <PackagingNotesSection
          packagingNotes={localOrder.packagingNotes}
          onAddClick={modals.packagingNotes.open}
        />
      </div>

      <OrderActionsFooter
        orderStatus={localOrder.status}
        onConfirm={handleConfirmClick}
        onFollowUpClick={handleFollowUpClick}
        onActionClick={handleActionClick}
        onWhatsappSubOptionClick={handleWhatsappSubOptionClick}
      />

      <OrderActionModals
        modals={modals}
        order={localOrder}
        actions={actions}
        confirmationDialog={confirmationDialog}
        onCloseConfirmation={() =>
          setConfirmationDialog({ isOpen: false, title: '', message: '', action: '' })
        }
        onConfirmAction={handleConfirmAction}
      />
    </>
  );
}

export default OrderDetailsInfoComponent;
