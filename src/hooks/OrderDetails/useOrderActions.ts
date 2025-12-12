import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { updateOrder, getNextOrderId } from '@/lib/api/order';
import { Order, OrderStatus, OrderStatusItem } from '@/types/orders';
import { ShippingData } from '@/components/OrderDetails/EditShippingModal';

/**
 * Options for useOrderActions hook
 */
export interface UseOrderActionsOptions {
  order: Order;
  onOrderUpdate?: (updatedOrder: Order) => void;
  onNavigateToNextOrder?: (nextOrderId: number) => void;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: OrderStatus | null;
  availableStatuses: OrderStatusItem[];
}

/**
 * Return type for useOrderActions hook
 */
export interface OrderActionsState {
  handleStatusUpdateAndNavigate: (
    status: OrderStatus,
    updateData?: Partial<Order> | Record<string, any>
  ) => Promise<boolean>;
  handleUrgent: (data: { shippingCost?: number; urgentDate: string }) => Promise<boolean>;
  handleCancel: (data: { reason: string; notes: string }) => Promise<boolean>;
  handleStopOperation: (notes: string) => Promise<boolean>;
  handlePostponeHours: (data: { duration?: '30min' | '1hour' | '2hours'; time?: Date }) => Promise<boolean>;
  handlePostponeDays: (data: { duration?: '1day' | '2days' | '3days' | 'week'; date?: Date }) => Promise<boolean>;
  handleRejectModification: () => Promise<boolean>;
  handleWaitingPayment: () => Promise<boolean>;
  handleConfirmAction: (action: string) => Promise<boolean>;
  handleUpdateShipping: (data: ShippingData) => Promise<void>;
  handleAddPackagingNote: (note: string) => Promise<void>;
}

/**
 * Custom hook to centralize all order action logic
 *
 * @param options - Configuration options
 * @returns Object with all action handler functions
 *
 * @example
 * const actions = useOrderActions({
 *   order: localOrder,
 *   onOrderUpdate,
 *   onNavigateToNextOrder,
 *   dateRange,
 *   statusFilter,
 *   availableStatuses
 * });
 *
 * // Usage: actions.handleConfirmAction(), actions.handleUrgent(data), etc.
 */
export function useOrderActions({
  order,
  onOrderUpdate,
  onNavigateToNextOrder,
  dateRange,
  statusFilter,
  availableStatuses,
}: UseOrderActionsOptions): OrderActionsState {
  /**
   * Map action strings to status values by searching through availableStatuses
   * This ensures we use the actual status values from the API rather than hardcoded enums
   */
  const getStatusFromAction = useCallback((action: string): OrderStatus | null => {
    // Map action strings to the status value identifiers we expect from the API
    const actionToStatusValueMap: Record<string, string> = {
      'confirm': 'CONFIRMED',
      'urgent': 'CONFIRMED',
      'cancel': 'CANCELLED',
      'stop_operation': 'STOPPED',
      'postpone_hours': 'POSTPONED',
      'postpone_days': 'POSTPONED',
      'waiting_payment': 'WAITING_FOR_PAYMENT',
      'reject_modification': 'REGISTERED',
      'no_answer': 'CALL_AGAIN',
      'closed': 'STOPPED',
      'not_collecting': 'STOPPED',
      'open_close': 'STOPPED',
    };

    const expectedStatusValue = actionToStatusValueMap[action];
    if (!expectedStatusValue) {
      return null;
    }

    // Search for the status in availableStatuses from the API
    const matchedStatus = availableStatuses.find(
      (status) => status.value === expectedStatusValue
    );

    // Return the matched status value, or null if not found
    return matchedStatus ? (matchedStatus.value as OrderStatus) : null;
  }, [availableStatuses]);

  /**
   * Core function to handle status update and navigation
   */
  const handleStatusUpdateAndNavigate = useCallback(
    async (
      status: OrderStatus,
      updateData: Partial<Order> | Record<string, any> = {}
    ): Promise<boolean> => {
      try {
        const updatedOrder = await updateOrder(order.id, {
          ...updateData,
          status,
        });

        if (onOrderUpdate) {
          onOrderUpdate(updatedOrder);
        }

        // Show success message
        const statusLabel = availableStatuses.find((s) => s.value === status)?.label || status;
        toast.success(`تم تحديث حالة الطلب إلى ${statusLabel} بنجاح`);

        // Try to get next order if date range is available
        if (onNavigateToNextOrder && dateRange) {
          const fromISO = dateRange.from?.toISOString();
          const toISO = dateRange.to?.toISOString();

          if (fromISO && toISO) {
            try {
              const nextOrderResponse = await getNextOrderId(
                order.id,
                statusFilter || undefined,
                fromISO,
                toISO
              );

              if (nextOrderResponse?.orderId) {
                onNavigateToNextOrder(nextOrderResponse.orderId);
              }
            } catch (nextErr) {
              console.error('Failed to get next order:', nextErr);
              // Continue even if next order fails
            }
          }
        }

        return true;
      } catch (error) {
        console.error('Failed to update order:', error);
        toast.error('فشل في تحديث الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }
    },
    [order.id, onOrderUpdate, onNavigateToNextOrder, dateRange, statusFilter, availableStatuses]
  );

  /**
   * Handle urgent action
   */
  const handleUrgent = useCallback(
    async (data: { shippingCost?: number; urgentDate: string }) => {
      const status = getStatusFromAction('urgent');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData: any = {
        urgentDate: data.urgentDate,
      };
      if (data.shippingCost !== undefined) {
        updateData.shippingCost = data.shippingCost;
      }
      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(
    async (data: { reason: string; notes: string }) => {
      const status = getStatusFromAction('cancel');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData: Partial<Order> = {
        notes: data.notes ? `${data.reason}: ${data.notes}` : data.reason,
      };
      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  /**
   * Handle stop operation action
   */
  const handleStopOperation = useCallback(
    async (notes: string) => {
      const status = getStatusFromAction('stop_operation');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData: Partial<Order> = {
        notes: notes,
      };
      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  /**
   * Handle postpone hours action
   */
  const handlePostponeHours = useCallback(
    async (data: { duration?: '30min' | '1hour' | '2hours'; time?: Date }) => {
      const status = getStatusFromAction('postpone_hours');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData: any = {};
      if (data.time) {
        updateData.executionDate = data.time.toISOString();
      }
      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  /**
   * Handle postpone days action
   */
  const handlePostponeDays = useCallback(
    async (data: { duration?: '1day' | '2days' | '3days' | 'week'; date?: Date }) => {
      const status = getStatusFromAction('postpone_days');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData: any = {};
      if (data.date) {
        updateData.executionDate = data.date.toISOString();
      }
      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  /**
   * Handle reject modification action
   */
  const handleRejectModification = useCallback(async () => {
    const status = getStatusFromAction('reject_modification');
    if (!status) {
      toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
      return false;
    }
    return await handleStatusUpdateAndNavigate(status);
  }, [getStatusFromAction, handleStatusUpdateAndNavigate]);

  /**
   * Handle waiting payment action
   */
  const handleWaitingPayment = useCallback(async () => {
    const status = getStatusFromAction('waiting_payment');
    if (!status) {
      toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
      return false;
    }
    return await handleStatusUpdateAndNavigate(status);
  }, [getStatusFromAction, handleStatusUpdateAndNavigate]);

  /**
   * Handle generic confirm action (from dialog)
   */
  const handleConfirmAction = useCallback(
    async (action: string) => {
      const status = getStatusFromAction(action);
      if (status) {
        return await handleStatusUpdateAndNavigate(status);
      }
      // Show error toast if status couldn't be determined
      toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
      return false;
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  /**
   * Handle shipping data update
   */
  const handleUpdateShipping = useCallback(
    async (data: ShippingData) => {
      try {
        const updatedOrder = await updateOrder(order.id, {
          shippingCompany: data.shippingCompany,
          customers: {
            governorate: data.governorate,
            city: data.city,
            address: data.address,
          },
        });

        if (onOrderUpdate) {
          onOrderUpdate(updatedOrder);
        }

        toast.success('تم تحديث بيانات الشحن بنجاح');
      } catch (error) {
        console.error('Failed to update shipping data:', error);
        toast.error('فشل في تحديث بيانات الشحن. يرجى المحاولة مرة أخرى.');
        throw error;
      }
    },
    [order.id, onOrderUpdate]
  );

  /**
   * Handle adding packaging note
   */
  const handleAddPackagingNote = useCallback(
    async (note: string) => {
      if (!note.trim()) return;

      try {
        const updatedNotes = order.packagingNotes
          ? `${order.packagingNotes}\n${note}`
          : note;

        const updatedOrder = await updateOrder(order.id, {
          packagingNotes: updatedNotes,
        });

        if (onOrderUpdate) {
          onOrderUpdate(updatedOrder);
        }

        toast.success('تم تحديث ملاحظات التغليف بنجاح');
      } catch (error) {
        console.error('Failed to update packaging notes:', error);
        toast.error('فشل في تحديث ملاحظات التغليف. يرجى المحاولة مرة أخرى.');
        throw error;
      }
    },
    [order.id, order.packagingNotes, onOrderUpdate]
  );

  return {
    handleStatusUpdateAndNavigate,
    handleUrgent,
    handleCancel,
    handleStopOperation,
    handlePostponeHours,
    handlePostponeDays,
    handleRejectModification,
    handleWaitingPayment,
    handleConfirmAction,
    handleUpdateShipping,
    handleAddPackagingNote,
  };
}
