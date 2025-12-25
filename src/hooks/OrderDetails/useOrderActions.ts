import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { Order, OrderStatus, OrderStatusItem } from '@/types/orders';
import { ShippingData } from '@/components/OrderDetails/EditShippingModal';
import { useUpdateOrder, useGetNextOrderId, useCancelOrder } from '@/services/orders';

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

export interface OrderActionsState {
  handleStatusUpdateAndNavigate: (
    status: OrderStatus,
    updateData?: Partial<Order> | Record<string, any>
  ) => Promise<boolean>;
  handleUrgent: (data: { shippingCost?: number; urgentDate: string }) => Promise<boolean>;
  handleCancel: (data: { reasonId: number; notes: string }) => Promise<boolean>;
  handleStopOperation: (notes: string) => Promise<boolean>;
  handlePostponeHours: (data: { duration?: '30min' | '1hour' | '2hours'; time?: Date }) => Promise<boolean>;
  handlePostponeDays: (data: { duration?: '1day' | '2days' | '3days' | 'week'; date?: Date }) => Promise<boolean>;
  handleRejectModification: () => Promise<boolean>;
  handleWaitingPayment: () => Promise<boolean>;
  handleConfirmAction: (action: string) => Promise<boolean>;
  handleFollowUpAction: (label: string) => Promise<boolean>;
  handleUpdateShipping: (data: ShippingData) => Promise<void>;
  handleAddPackagingNote: (note: string) => Promise<void>;
}

export function useOrderActions({
  order,
  onOrderUpdate,
  onNavigateToNextOrder,
  dateRange,
  statusFilter,
  availableStatuses,
}: UseOrderActionsOptions): OrderActionsState {
  const updateOrderMutation = useUpdateOrder();
  const cancelOrderMutation = useCancelOrder();
  const { getNextOrderId } = useGetNextOrderId();

  const getStatusFromAction = useCallback((action: string): OrderStatus | null => {
    const actionToStatusValueMap: Record<string, string> = {
      'confirm': 'CONFIRMED',
      'urgent': 'CONFIRMED',
      'cancel': 'CANCELLED',
      'stop_operation': 'STOPPED',
      'postpone_hours': 'POSTPONED',
      'postpone_days': 'POSTPONED',
      'waiting_payment': 'WAITING_FOR_PAYMENT',
      'reject_modification': 'STOPPED',
      'no_answer': 'CALL_AGAIN',
      'closed': 'STOPPED',
      'not_collecting': 'STOPPED',
      'open_close': 'STOPPED',
    };

    const expectedStatusValue = actionToStatusValueMap[action];
    if (!expectedStatusValue) {
      return null;
    }

    const matchedStatus = availableStatuses.find(
      (status) => status.key === expectedStatusValue
    );

    return matchedStatus ? (matchedStatus.key as OrderStatus) : null;
  }, [availableStatuses]);

  const handleStatusUpdateAndNavigate = useCallback(
    async (
      status: OrderStatus,
      updateData: Partial<Order> | Record<string, any> = {}
    ): Promise<boolean> => {
      try {
        const updatedOrder = await updateOrderMutation.mutateAsync({
          orderId: order.id,
          data: {
            ...updateData,
            status: status,
          },
        });

        if (onOrderUpdate) {
          onOrderUpdate(updatedOrder);
        }

        const statusLabel = availableStatuses.find((s) => s.key === status)?.label || status;
        toast.success(`تم تحديث حالة الطلب إلى ${statusLabel} بنجاح`);

        if (onNavigateToNextOrder) {
          const fromISO = dateRange?.from?.toISOString();
          const toISO = dateRange?.to?.toISOString();

          try {
            const nextOrderResponse = await getNextOrderId(
              order.id,
              statusFilter || undefined,
              fromISO,
              toISO
            );

            if (nextOrderResponse?.id) {
              onNavigateToNextOrder(nextOrderResponse.id);
            }
          } catch (nextErr: any) {
            console.error('Failed to get next order:', nextErr);
            const errorMessage =
              nextErr?.response?.data?.message ||
              'لا يوجد طلبات أخرى مطابقة للفلاتر';
            toast.info(errorMessage);
          }
        }

        return true;
      } catch (error: any) {
        console.error('Failed to update order:', error);
        // Extract error message from API response
        const apiErrorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'فشل في تحديث الطلب. يرجى المحاولة مرة أخرى.';
        // Re-throw with the API error message
        throw new Error(apiErrorMessage);
      }
    },
    [order.id, onOrderUpdate, onNavigateToNextOrder, dateRange, statusFilter, availableStatuses, updateOrderMutation, getNextOrderId]
  );

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

  const handleCancel = useCallback(
    async (data: { reasonId: number; notes: string }) => {
      try {
        const updatedOrder = await cancelOrderMutation.mutateAsync({
          orderId: order.id,
          reasonId: data.reasonId,
          notes: data.notes || undefined,
        });

        if (onOrderUpdate) {
          onOrderUpdate(updatedOrder);
        }

        toast.success('تم إلغاء الطلب بنجاح');

        if (onNavigateToNextOrder) {
          const fromISO = dateRange?.from?.toISOString();
          const toISO = dateRange?.to?.toISOString();

          try {
            const nextOrderResponse = await getNextOrderId(
              order.id,
              statusFilter || undefined,
              fromISO,
              toISO
            );

            if (nextOrderResponse?.id) {
              onNavigateToNextOrder(nextOrderResponse.id);
            }
          } catch (nextErr: any) {
            console.error('Failed to get next order:', nextErr);
            const errorMessage =
              nextErr?.response?.data?.message ||
              'لا يوجد طلبات أخرى مطابقة للفلاتر';
            toast.info(errorMessage);
          }
        }

        return true;
      } catch (error: any) {
        console.error('Failed to cancel order:', error);
        const apiErrorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'فشل في إلغاء الطلب. يرجى المحاولة مرة أخرى.';
        throw new Error(apiErrorMessage);
      }
    },
    [order.id, onOrderUpdate, onNavigateToNextOrder, dateRange, statusFilter, cancelOrderMutation, getNextOrderId]
  );

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

  const handlePostponeHours = useCallback(
    async (data: { duration?: '30min' | '1hour' | '2hours'; time?: Date }) => {
      const status = getStatusFromAction('postpone_hours');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData: Record<string, unknown> = {};
      if (data.time) {
        updateData.postponedUntil = data.time.toISOString();
      }
      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  const handlePostponeDays = useCallback(
    async (data: { duration?: '1day' | '2days' | '3days' | 'week'; date?: Date }) => {
      const status = getStatusFromAction('postpone_days');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData: Record<string, unknown> = {};
      if (data.date) {
        updateData.postponedUntil = data.date.toISOString();
      }
      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  const handleRejectModification = useCallback(async () => {
    const status = getStatusFromAction('reject_modification');
    if (!status) {
      toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
      return false;
    }
    return await handleStatusUpdateAndNavigate(status);
  }, [getStatusFromAction, handleStatusUpdateAndNavigate]);

  const handleWaitingPayment = useCallback(async () => {
    const status = getStatusFromAction('waiting_payment');
    if (!status) {
      toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
      return false;
    }
    return await handleStatusUpdateAndNavigate(status);
  }, [getStatusFromAction, handleStatusUpdateAndNavigate]);

  const handleConfirmAction = useCallback(
    async (action: string) => {
      const status = getStatusFromAction(action);
      if (!status) {
        throw new Error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
      }
      return await handleStatusUpdateAndNavigate(status);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  const handleFollowUpAction = useCallback(
    async (label: string): Promise<boolean> => {
      try {
        const updatedOrder = await updateOrderMutation.mutateAsync({
          orderId: order.id,
          data: {
            status: 'ATTEMPTED',
            eventNote: label,
          },
        });

        if (onOrderUpdate) {
          onOrderUpdate(updatedOrder);
        }

        toast.success(`تم تسجيل المتابعة: ${label}`);

        if (onNavigateToNextOrder) {
          const fromISO = dateRange?.from?.toISOString();
          const toISO = dateRange?.to?.toISOString();

          try {
            const nextOrderResponse = await getNextOrderId(
              order.id,
              statusFilter || undefined,
              fromISO,
              toISO
            );

            if (nextOrderResponse?.id) {
              onNavigateToNextOrder(nextOrderResponse.id);
            }
          } catch (nextErr: any) {
            console.error('Failed to get next order:', nextErr);
            const errorMessage =
              nextErr?.response?.data?.message ||
              'لا يوجد طلبات أخرى مطابقة للفلاتر';
            toast.info(errorMessage);
          }
        }

        return true;
      } catch (error: any) {
        console.error('Failed to update follow-up:', error);
        // Extract error message from API response
        const apiErrorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'فشل في تسجيل المتابعة. يرجى المحاولة مرة أخرى.';
        // Re-throw with the API error message
        throw new Error(apiErrorMessage);
      }
    },
    [order.id, onOrderUpdate, onNavigateToNextOrder, dateRange, statusFilter, updateOrderMutation, getNextOrderId]
  );

  const handleUpdateShipping = useCallback(
    async (data: ShippingData) => {
      try {
        // Send flat object (not nested in customers)
        const updatedOrder = await updateOrderMutation.mutateAsync({
          orderId: order.id,
          data: {
            shippingCompany: data.shippingCompany,
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
    [order.id, onOrderUpdate, updateOrderMutation]
  );

  const handleAddPackagingNote = useCallback(
    async (note: string) => {
      if (!note.trim()) return;

      try {
        const updatedNotes = order.packagingNotes
          ? `${order.packagingNotes}\n${note}`
          : note;

        const updatedOrder = await updateOrderMutation.mutateAsync({
          orderId: order.id,
          data: {
            packagingNotes: updatedNotes,
          },
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
    [order.id, order.packagingNotes, onOrderUpdate, updateOrderMutation]
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
    handleFollowUpAction,
    handleUpdateShipping,
    handleAddPackagingNote,
  };
}
