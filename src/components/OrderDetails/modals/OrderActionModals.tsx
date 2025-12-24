import React, { useState } from 'react';
import { Order } from '@/types/orders';
import { ModalStates } from '@/hooks/OrderDetails/useModalState';
import { OrderActionsState } from '@/hooks/OrderDetails/useOrderActions';
import ActionConfirmationDialog from '../ActionConfirmationDialog';
import EditShippingModal, { ShippingData } from '../EditShippingModal';
import SimpleConfirmationModal from '../SimpleConfirmationModal';
import BaseModal from '@/components/ui/base-modal';
import {
  UrgentModal,
  CancelOrderModal,
  StopOperationModal,
  PostponeHoursModal,
  PostponeDaysModal,
  AddColorProductModal,
} from '../ActionModals';

/**
 * Props for OrderActionModals component
 */
export interface OrderActionModalsProps {
  modals: ModalStates;
  order: Order;
  actions: OrderActionsState;
  confirmationDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    action: string;
  };
  onCloseConfirmation: () => void;
  onConfirmAction: () => Promise<void>;
}

/**
 * OrderActionModals Component
 *
 * Orchestrates and renders all action modals in one place
 *
 * @param props - Component props
 */
export function OrderActionModals({
  modals,
  order,
  actions,
  confirmationDialog,
  onCloseConfirmation,
  onConfirmAction,
}: OrderActionModalsProps) {
  const [newPackagingNote, setNewPackagingNote] = useState('');

  // Handlers for modals that need to close on success
  const handleUrgentConfirm = async (data: { shippingCost?: number; urgentDate: string }) => {
    const success = await actions.handleUrgent(data);
    if (success) {
      modals.urgent.close();
    }
  };

  const handleCancelOrderConfirm = async (data: { reason: string; notes: string }) => {
    const success = await actions.handleCancel(data);
    if (success) {
      modals.cancel.close();
    }
  };

  const handleStopOperationConfirm = async (notes: string) => {
    const success = await actions.handleStopOperation(notes);
    if (success) {
      modals.stopOperation.close();
    }
  };

  const handlePostponeHoursConfirm = async (data: {
    duration?: '30min' | '1hour' | '2hours';
    time?: Date;
  }) => {
    const success = await actions.handlePostponeHours(data);
    if (success) {
      modals.postponeHours.close();
    }
  };

  const handlePostponeDaysConfirm = async (data: {
    duration?: '1day' | '2days' | '3days' | 'week';
    date?: Date;
  }) => {
    const success = await actions.handlePostponeDays(data);
    if (success) {
      modals.postponeDays.close();
    }
  };

  const handleAddColorProductConfirm = (color: string) => {
    console.log('Color product selected:', color);
    // TODO: Add logic to send color image via WhatsApp
    modals.addColorProduct.close();
  };

  const handleRejectModificationConfirm = async () => {
    const success = await actions.handleRejectModification();
    if (!success) {
      throw new Error('Failed to reject modification');
    }
    modals.rejectModification.close();
  };

  const handleWaitingPaymentConfirm = async () => {
    const success = await actions.handleWaitingPayment();
    if (!success) {
      throw new Error('Failed to update payment status');
    }
    modals.waitingPayment.close();
  };

  const handleShippingSave = async (data: ShippingData) => {
    // Let errors propagate to the modal's handleSave which handles closing
    await actions.handleUpdateShipping(data);
  };

  const handlePackagingNoteSave = async () => {
    try {
      await actions.handleAddPackagingNote(newPackagingNote);
      setNewPackagingNote('');
      modals.packagingNotes.close();
    } catch (error) {
      // Error is already handled by the action (toast shown)
      // Don't close the modal so user can retry
      console.error('Failed to add packaging note:', error);
    }
  };

  return (
    <>
      {/* Confirmation Dialog */}
      <ActionConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={onCloseConfirmation}
        onConfirm={onConfirmAction}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
      />

      {/* Edit Shipping Modal */}
      <EditShippingModal
        isOpen={modals.shipping.isOpen}
        onClose={modals.shipping.close}
        onSave={handleShippingSave}
        initialData={{
          shippingCompany: order.shippingCompany,
          governorate: order.customers.governorate,
          city: order.customers.city,
          address: order.customers.address,
        }}
      />

      {/* Action Modals */}
      <UrgentModal
        isOpen={modals.urgent.isOpen}
        onClose={modals.urgent.close}
        onConfirm={handleUrgentConfirm}
      />

      <CancelOrderModal
        isOpen={modals.cancel.isOpen}
        onClose={modals.cancel.close}
        onConfirm={handleCancelOrderConfirm}
      />

      <StopOperationModal
        isOpen={modals.stopOperation.isOpen}
        onClose={modals.stopOperation.close}
        onConfirm={handleStopOperationConfirm}
      />

      <PostponeHoursModal
        isOpen={modals.postponeHours.isOpen}
        onClose={modals.postponeHours.close}
        onConfirm={handlePostponeHoursConfirm}
      />

      <PostponeDaysModal
        isOpen={modals.postponeDays.isOpen}
        onClose={modals.postponeDays.close}
        onConfirm={handlePostponeDaysConfirm}
      />

      <AddColorProductModal
        isOpen={modals.addColorProduct.isOpen}
        onClose={modals.addColorProduct.close}
        onSave={handleAddColorProductConfirm}
        currentProductColors={
          order.order_products?.map((op) => op.products.color).filter(Boolean) as string[]
        }
      />

      {/* Simple Confirmation Modals */}
      <SimpleConfirmationModal
        isOpen={modals.rejectModification.isOpen}
        onClose={modals.rejectModification.close}
        onConfirm={handleRejectModificationConfirm}
        title="رفض التعديل"
        message="هل أنت متأكد من رفض التعديل لهذا الطلب؟"
      />

      <SimpleConfirmationModal
        isOpen={modals.waitingPayment.isOpen}
        onClose={modals.waitingPayment.close}
        onConfirm={handleWaitingPaymentConfirm}
        title="في انتظار الدفع"
        message="هل أنت متأكد من تحديد الطلب كـ في انتظار الدفع؟"
      />

      {/* Packaging Notes Modal */}
      <BaseModal
        isOpen={modals.packagingNotes.isOpen}
        onClose={() => {
          modals.packagingNotes.close();
          setNewPackagingNote('');
        }}
        title="إضافة ملاحظة للتغليف"
        onConfirm={handlePackagingNoteSave}
        confirmText="حفظ"
        confirmDisabled={!newPackagingNote.trim()}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-[#1F1F1F]">الملاحظة</label>
            <textarea
              value={newPackagingNote}
              onChange={(e) => setNewPackagingNote(e.target.value)}
              placeholder="أدخل ملاحظة للتغليف..."
              className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
            />
          </div>
        </div>
      </BaseModal>
    </>
  );
}
