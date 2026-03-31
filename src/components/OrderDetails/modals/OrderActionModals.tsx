import React, { useState } from 'react';
import { Order } from '@/types/orders';
import { ModalStates } from '@/hooks/OrderDetails/useModalState';
import { OrderActionsState } from '@/hooks/OrderDetails/useOrderActions';
import ActionConfirmationDialog from '../ActionConfirmationDialog';
import EditShippingModal, { ShippingData } from '../EditShippingModal';
import BaseModal from '@/components/ui/base-modal';
import {
  UrgentModal,
  CancelOrderModal,
  StopOperationModal,
  PostponeHoursModal,
  PostponeDaysModal,
  AddColorProductModal,
  RejectModificationModal,
  WhatsappModal,
  WaitingPaymentModal,
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
  onError?: (message: string) => void;
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
  onError,
}: OrderActionModalsProps) {
  const [newPackagingNote, setNewPackagingNote] = useState('');

  // Handlers for modals that need to close on success
  const handleUrgentConfirm = async (data: { shippingCost?: number; urgentDate: string }) => {
    try {
      const success = await actions.handleUrgent(data);
      if (success) {
        modals.urgent.close();
      }
    } catch (error: any) {
      if (onError) {
        onError(error?.message || 'فشل في تحديث الطلب. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const handleCancelOrderConfirm = async (data: { reasonId: number; notes: string }) => {
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

  const handleRejectModificationConfirm = async (notes: string) => {
    const success = await actions.handleRejectModification(notes);
    if (success) {
      modals.rejectModification.close();
    }
  };

  const handleWaitingPaymentConfirm = async (note?: string) => {
    const success = await actions.handleWaitingPayment(note);
    if (success) {
      modals.waitingPayment.close();
    }
  };

  const handleWhatsappConfirm = async (note?: string) => {
    const success = await actions.handleWhatsapp(note);
    if (success) {
      modals.whatsapp.close();
    }
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
          governorate: order.governorate,
          city: order.city,
          address: order.address,
          externalGovernorate: order.externalGovernorate,
          returnShippingCost: order.returnShippingCost,
          availableFrom: order.availableFrom || order.timeFrom,
          availableTo: order.availableTo || order.timeTo,
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

      {/* Reject Modification Modal */}
      <RejectModificationModal
        isOpen={modals.rejectModification.isOpen}
        onClose={modals.rejectModification.close}
        onConfirm={handleRejectModificationConfirm}
      />

      {/* Waiting Payment Modal */}
      <WaitingPaymentModal
        isOpen={modals.waitingPayment.isOpen}
        onClose={modals.waitingPayment.close}
        onConfirm={handleWaitingPaymentConfirm}
      />

      <WhatsappModal
        isOpen={modals.whatsapp.isOpen}
        onClose={modals.whatsapp.close}
        onConfirm={handleWhatsappConfirm}
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
              className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </BaseModal>
    </>
  );
}
