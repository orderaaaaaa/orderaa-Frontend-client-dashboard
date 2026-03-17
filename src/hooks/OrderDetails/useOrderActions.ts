import { useCallback, useRef, useEffect } from 'react';
import { formatLocalStartOfDay, formatLocalEndOfDay } from '@/utils/dateRangeUtils';
import { toast } from 'react-toastify';
import { Order, OrderStatusItem } from '@/types/orders';
import { ShippingData } from '@/components/OrderDetails/EditShippingModal';
import {
  useUpdateOrder,
  useGetNextOrderId,
  useCancelOrder,
} from '@/services/orders';

export interface UseOrderActionsOptions {
  order: Order;
  onOrderUpdate?: (updatedOrder: Order) => void;
  onNavigateToNextOrder?: (nextOrderId: number) => void;
  onNoOrdersFound?: () => void;
  onUnlock?: () => Promise<void>;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: string | null;
  availableStatuses: OrderStatusItem[];
}

export interface OrderActionsState {
  handleStatusUpdateAndNavigate: (
    status: string,
    updateData?: Partial<Order> | Record<string, any>
  ) => Promise<boolean>;
  handleUrgent: (data: {
    shippingCost?: number;
    urgentDate: string;
  }) => Promise<boolean>;
  handleCancel: (data: { reasonId: number; notes: string }) => Promise<boolean>;
  handleStopOperation: (notes: string) => Promise<boolean>;
  handlePostponeHours: (data: {
    duration?: '30min' | '1hour' | '2hours';
    time?: Date;
  }) => Promise<boolean>;
  handlePostponeDays: (data: {
    duration?: '1day' | '2days' | '3days' | 'week';
    date?: Date;
  }) => Promise<boolean>;
  handleRejectModification: (notes: string) => Promise<boolean>;
  handleWaitingPayment: (note?: string) => Promise<boolean>;
  handleWhatsapp: (note?: string) => Promise<boolean>;
  handleConfirmAction: (action: string) => Promise<boolean>;
  handleFollowUpAction: (label: string) => Promise<boolean>;
  handleUpdateShipping: (data: ShippingData) => Promise<void>;
  handleAddPackagingNote: (note: string) => Promise<void>;
}

export function useOrderActions({
  order,
  onOrderUpdate,
  onNavigateToNextOrder,
  onNoOrdersFound,
  onUnlock,
  dateRange,
  statusFilter,
  availableStatuses,
}: UseOrderActionsOptions): OrderActionsState {
  const updateOrderMutation = useUpdateOrder();
  const cancelOrderMutation = useCancelOrder();
  const { getNextOrderId } = useGetNextOrderId();

  // Use ref to always have access to the latest callback in async operations
  const onNoOrdersFoundRef = useRef(onNoOrdersFound);
  useEffect(() => {
    onNoOrdersFoundRef.current = onNoOrdersFound;
  }, [onNoOrdersFound]);

  const onUnlockRef = useRef(onUnlock);
  useEffect(() => {
    onUnlockRef.current = onUnlock;
  }, [onUnlock]);

  const getStatusFromAction = useCallback(
    (action: string): string | null => {
      const actionToStatusValueMap: Record<string, string> = {
        confirm: 'CONFIRMED',
        urgent: 'CONFIRMED',
        cancel: 'CANCELLED',
        stop_operation: 'STOPPED',
        postpone_hours: 'POSTPONED',
        postpone_days: 'POSTPONED',
        waiting_payment: 'WAITING_FOR_PAYMENT',
        reject_modification: 'EDIT_REJECTED',
        whatsapp: 'WHATSAPP',
        no_answer: 'CALL_AGAIN',
        closed: 'STOPPED',
        not_collecting: 'STOPPED',
        open_close: 'STOPPED',
      };

      const expectedStatusValue = actionToStatusValueMap[action];
      if (!expectedStatusValue) {
        return null;
      }

      const matchedStatus = availableStatuses.find(
        (status) => status.key === expectedStatusValue
      );

      return matchedStatus ? matchedStatus.key : null;
    },
    [availableStatuses]
  );

  const handleStatusUpdateAndNavigate = useCallback(
    async (
      status: string,
      updateData: Partial<Order> | Record<string, any> = {},
      options: { skipToast?: boolean } = {}
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

        if (onUnlockRef.current) {
          await onUnlockRef.current();
        }

        const statusLabel =
          availableStatuses.find((s) => s.key === status)?.label || status;
        toast.success(`تم تحديث حالة الطلب إلى ${statusLabel} بنجاح`);

        if (onNavigateToNextOrder) {
          const fromISO = dateRange?.from ? formatLocalStartOfDay(dateRange.from) : undefined;
          const toISO = dateRange?.to ? formatLocalEndOfDay(dateRange.to) : undefined;

          try {
            const nextOrderResponse = await getNextOrderId(
              order.id,
              statusFilter || undefined,
              fromISO,
              toISO
            );

            if (nextOrderResponse?.id) {
              onNavigateToNextOrder(nextOrderResponse.id);
            } else if (onNoOrdersFoundRef.current) {
              onNoOrdersFoundRef.current();
            } else {
              toast.info('لا يوجد طلبات أخرى مطابقة للفلاتر');
            }
          } catch (nextErr: any) {
            console.error('Failed to get next order:', nextErr);
            if (onNoOrdersFoundRef.current) {
              onNoOrdersFoundRef.current();
            } else {
              const errorMessage =
                nextErr?.response?.data?.message ||
                'لا يوجد طلبات أخرى مطابقة للفلاتر';
              toast.info(errorMessage);
            }
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
        // Show error toast with backend message (unless skipToast is true)
        if (!options.skipToast) {
          toast.error(apiErrorMessage);
        }
        // Re-throw so callers can also handle (e.g., show ErrorModal)
        throw new Error(apiErrorMessage);
      }
    },
    [
      order.id,
      onOrderUpdate,
      onNavigateToNextOrder,
      onNoOrdersFound,
      dateRange,
      statusFilter,
      availableStatuses,
      updateOrderMutation,
      getNextOrderId,
    ]
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
      return await handleStatusUpdateAndNavigate(status, updateData, {
        skipToast: true,
      });
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

        if (onUnlockRef.current) {
          await onUnlockRef.current();
        }

        toast.success('تم إلغاء الطلب بنجاح');

        if (onNavigateToNextOrder) {
          const fromISO = dateRange?.from ? formatLocalStartOfDay(dateRange.from) : undefined;
          const toISO = dateRange?.to ? formatLocalEndOfDay(dateRange.to) : undefined;

          try {
            const nextOrderResponse = await getNextOrderId(
              order.id,
              statusFilter || undefined,
              fromISO,
              toISO
            );

            if (nextOrderResponse?.id) {
              onNavigateToNextOrder(nextOrderResponse.id);
            } else if (onNoOrdersFoundRef.current) {
              onNoOrdersFoundRef.current();
            } else {
              toast.info('لا يوجد طلبات أخرى مطابقة للفلاتر');
            }
          } catch (nextErr: any) {
            console.error('Failed to get next order:', nextErr);
            if (onNoOrdersFoundRef.current) {
              onNoOrdersFoundRef.current();
            } else {
              const errorMessage =
                nextErr?.response?.data?.message ||
                'لا يوجد طلبات أخرى مطابقة للفلاتر';
              toast.info(errorMessage);
            }
          }
        }

        return true;
      } catch (error: any) {
        console.error('Failed to cancel order:', error);
        // Extract error message from API response (handle both string and array formats)
        const responseMessage = error?.response?.data?.message;
        let apiErrorMessage: string;
        if (Array.isArray(responseMessage)) {
          apiErrorMessage = responseMessage.join(', ');
        } else {
          apiErrorMessage =
            responseMessage ||
            error?.response?.data?.error ||
            error?.message ||
            'فشل في إلغاء الطلب. يرجى المحاولة مرة أخرى.';
        }
        toast.error(apiErrorMessage);
        return false;
      }
    },
    [
      order.id,
      onOrderUpdate,
      onNavigateToNextOrder,
      onNoOrdersFound,
      dateRange,
      statusFilter,
      cancelOrderMutation,
      getNextOrderId,
    ]
  );

  const handleStopOperation = useCallback(
    async (notes: string) => {
      const status = getStatusFromAction('stop_operation');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData = {
        eventNote: notes,
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
      } else if (data.duration) {
        const now = new Date();
        const postponedTime = new Date(now);

        switch (data.duration) {
          case '30min':
            postponedTime.setMinutes(now.getMinutes() + 30);
            break;
          case '1hour':
            postponedTime.setHours(now.getHours() + 1);
            break;
          case '2hours':
            postponedTime.setHours(now.getHours() + 2);
            break;
        }

        updateData.postponedUntil = postponedTime.toISOString();
      }

      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  const handlePostponeDays = useCallback(
    async (data: {
      duration?: '1day' | '2days' | '3days' | 'week';
      date?: Date;
    }) => {
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

  const handleRejectModification = useCallback(
    async (notes: string) => {
      const status = getStatusFromAction('reject_modification');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData = {
        eventNote: notes,
      };
      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  const handleWaitingPayment = useCallback(
    async (note?: string) => {
      const status = getStatusFromAction('waiting_payment');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData: Record<string, unknown> = {};
      if (note) {
        updateData.eventNote = note;
      }
      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  const handleWhatsapp = useCallback(
    async (note?: string) => {
      const status = getStatusFromAction('whatsapp');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData: Record<string, unknown> = {};
      if (note) {
        updateData.eventNote = note;
      }
      return await handleStatusUpdateAndNavigate(status, updateData);
    },
    [getStatusFromAction, handleStatusUpdateAndNavigate]
  );

  const handleConfirmAction = useCallback(
    async (action: string) => {
      const status = getStatusFromAction(action);
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
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

        if (onUnlockRef.current) {
          await onUnlockRef.current();
        }

        toast.success(`تم تسجيل المتابعة: ${label}`);

        if (onNavigateToNextOrder) {
          const fromISO = dateRange?.from ? formatLocalStartOfDay(dateRange.from) : undefined;
          const toISO = dateRange?.to ? formatLocalEndOfDay(dateRange.to) : undefined;

          try {
            const nextOrderResponse = await getNextOrderId(
              order.id,
              statusFilter || undefined,
              fromISO,
              toISO
            );

            if (nextOrderResponse?.id) {
              onNavigateToNextOrder(nextOrderResponse.id);
            } else if (onNoOrdersFoundRef.current) {
              onNoOrdersFoundRef.current();
            } else {
              toast.info('لا يوجد طلبات أخرى مطابقة للفلاتر');
            }
          } catch (nextErr: any) {
            console.error('Failed to get next order:', nextErr);
            if (onNoOrdersFoundRef.current) {
              onNoOrdersFoundRef.current();
            } else {
              const errorMessage =
                nextErr?.response?.data?.message ||
                'لا يوجد طلبات أخرى مطابقة للفلاتر';
              toast.info(errorMessage);
            }
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
        // Show error toast with backend message
        toast.error(apiErrorMessage);
        return false;
      }
    },
    [
      order.id,
      onOrderUpdate,
      onNavigateToNextOrder,
      onNoOrdersFound,
      dateRange,
      statusFilter,
      updateOrderMutation,
      getNextOrderId,
    ]
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
      } catch (error: any) {
        console.error('Failed to update shipping data:', error);
        // Extract error message from API response
        const apiErrorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'فشل في تحديث بيانات الشحن. يرجى المحاولة مرة أخرى.';
        toast.error(apiErrorMessage);
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
      } catch (error: any) {
        console.error('Failed to update packaging notes:', error);
        // Extract error message from API response
        const apiErrorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'فشل في تحديث ملاحظات التغليف. يرجى المحاولة مرة أخرى.';
        toast.error(apiErrorMessage);
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
    handleWhatsapp,
    handleConfirmAction,
    handleFollowUpAction,
    handleUpdateShipping,
    handleAddPackagingNote,
  };
}
