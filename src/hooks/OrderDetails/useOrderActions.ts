import { useCallback, useRef, useEffect, useState } from 'react';
import { formatLocalStartOfDay, formatLocalEndOfDay } from '@/utils/dateRangeUtils';
import { toast } from 'react-toastify';
import { getApiErrorMessage, getOutOfStockBlock } from '@/utils/apiError';
import { FilterOrdersDto, Order, OrderStatusItem } from '@/types/orders';
import { ShippingData } from '@/components/OrderDetails/EditShippingModal';
import { locationSaveErrorTextOf } from '@/types/locationOptions';
import { SHIPPING_COMPANY_REQUIRED_MESSAGE } from '@/types/shippingCompanies';
import {
  useUpdateOrder,
  useGetNextOrderId,
  useCancelOrder,
} from '@/services/orders';

export type OrderUpdatePayload = Partial<Order> | Record<string, unknown>;

export interface UseOrderActionsOptions {
  order: Order;
  onNavigateToNextOrder?: (nextOrderId: number) => void | Promise<void>;
  onNoOrdersFound?: () => void;
  onUnlock?: () => Promise<void>;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: string | null;
  navigationFilters?: FilterOrdersDto;
  availableStatuses: OrderStatusItem[];
}

function buildNavFilters(
  navigationFilters: FilterOrdersDto | undefined,
  statusFilter: string | null | undefined,
  dateRange: { from: Date | null; to: Date | null } | undefined
): FilterOrdersDto {
  if (navigationFilters) {
    return navigationFilters;
  }
  const filters: FilterOrdersDto = {};
  if (statusFilter) filters.status = statusFilter;
  if (dateRange?.from) filters.createdAfter = formatLocalStartOfDay(dateRange.from);
  if (dateRange?.to) filters.createdBefore = formatLocalEndOfDay(dateRange.to);
  return filters;
}

const NO_MATCHING_ORDERS_MESSAGE = 'لا يوجد طلبات أخرى مطابقة للفلاتر';
const UPDATE_FAILED_MESSAGE = 'فشل في تحديث الطلب. يرجى المحاولة مرة أخرى.';

const cancelErrorMessageOf = (error: unknown) => {
  const data = (
    error as {
      response?: { data?: { message?: string | string[]; error?: string } };
    }
  )?.response?.data;
  if (Array.isArray(data?.message)) {
    return data.message.join(', ');
  }
  return (
    data?.message ||
    data?.error ||
    (error instanceof Error ? error.message : '') ||
    'فشل في إلغاء الطلب. يرجى المحاولة مرة أخرى.'
  );
};

export interface OrderActionsState {
  isTransitioning: boolean;
  handleStatusUpdateAndNavigate: (
    status: string,
    updateData?: OrderUpdatePayload
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
  onNavigateToNextOrder,
  onNoOrdersFound,
  onUnlock,
  dateRange,
  statusFilter,
  navigationFilters,
  availableStatuses,
}: UseOrderActionsOptions): OrderActionsState {
  const updateOrderMutation = useUpdateOrder();
  const cancelOrderMutation = useCancelOrder();
  const { getNextOrderId } = useGetNextOrderId();
  const [transitionCount, setTransitionCount] = useState(0);

  // Use ref to always have access to the latest callback in async operations
  const onNoOrdersFoundRef = useRef(onNoOrdersFound);
  useEffect(() => {
    onNoOrdersFoundRef.current = onNoOrdersFound;
  }, [onNoOrdersFound]);

  const onUnlockRef = useRef(onUnlock);
  useEffect(() => {
    onUnlockRef.current = onUnlock;
  }, [onUnlock]);

  const beginTransition = useCallback(() => {
    let ended = false;
    setTransitionCount((count) => count + 1);
    return () => {
      if (ended) return;
      ended = true;
      setTransitionCount((count) => count - 1);
    };
  }, []);

  const runTransition = useCallback(
    async <T,>(work: () => Promise<T>): Promise<T> => {
      const endTransition = beginTransition();
      try {
        return await work();
      } finally {
        endTransition();
      }
    },
    [beginTransition]
  );

  const advanceToNextOrder = useCallback(async () => {
    if (!onNavigateToNextOrder) return;
    try {
      const nextOrderResponse = await getNextOrderId(
        order.id,
        buildNavFilters(navigationFilters, statusFilter, dateRange)
      );

      if (nextOrderResponse?.id) {
        await onNavigateToNextOrder(nextOrderResponse.id);
      } else if (onNoOrdersFoundRef.current) {
        onNoOrdersFoundRef.current();
      } else {
        toast.info(NO_MATCHING_ORDERS_MESSAGE);
      }
    } catch (nextErr: unknown) {
      console.error('Failed to get next order:', nextErr);
      if (onNoOrdersFoundRef.current) {
        onNoOrdersFoundRef.current();
      } else {
        toast.info(getApiErrorMessage(nextErr, NO_MATCHING_ORDERS_MESSAGE));
      }
    }
  }, [
    order.id,
    onNavigateToNextOrder,
    dateRange,
    statusFilter,
    navigationFilters,
    getNextOrderId,
  ]);

  const completeAndAdvance = useCallback(
    async (successMessage: string) => {
      if (onUnlockRef.current) {
        await onUnlockRef.current();
      }
      toast.success(successMessage);
      await advanceToNextOrder();
    },
    [advanceToNextOrder]
  );

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
      updateData: OrderUpdatePayload = {},
      options: { skipToast?: boolean } = {}
    ): Promise<boolean> => {
      if (
        status === 'CONFIRMED' &&
        (order.shippingCompanyId ?? null) === null &&
        !('shippingCompanyId' in updateData && updateData.shippingCompanyId != null)
      ) {
        if (!options.skipToast) {
          toast.error(SHIPPING_COMPANY_REQUIRED_MESSAGE);
        }
        throw new Error(SHIPPING_COMPANY_REQUIRED_MESSAGE);
      }
      const endTransition = beginTransition();
      try {
        await updateOrderMutation.mutateAsync({
          orderId: order.id,
          data: {
            ...updateData,
            status: status,
          },
        });
      } catch (error: unknown) {
        // T27: a 409 refusing an out-of-stock confirmation names every blocking
        // product, so surface those rather than a generic failure.
        const outOfStock = getOutOfStockBlock(error);
        const apiErrorMessage =
          outOfStock?.message ??
          getApiErrorMessage(error, UPDATE_FAILED_MESSAGE);
        if (!options.skipToast) {
          toast.error(
            apiErrorMessage,
            outOfStock ? { autoClose: 8000 } : undefined
          );
        }
        endTransition();
        throw new Error(apiErrorMessage);
      }

      try {
        const statusLabel =
          availableStatuses.find((s) => s.key === status)?.label || status;
        await completeAndAdvance(`تم تحديث حالة الطلب إلى ${statusLabel} بنجاح`);
        return true;
      } finally {
        endTransition();
      }
    },
    [
      order.id,
      order.shippingCompanyId,
      availableStatuses,
      updateOrderMutation,
      beginTransition,
      completeAndAdvance,
    ]
  );

  const handleUrgent = useCallback(
    async (data: { shippingCost?: number; urgentDate: string }) => {
      const status = getStatusFromAction('urgent');
      if (!status) {
        toast.error('فشل في تحديد حالة الطلب. يرجى المحاولة مرة أخرى.');
        return false;
      }

      const updateData: Record<string, unknown> = {
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
    async (data: { reasonId: number; notes: string }) =>
      runTransition(async () => {
        try {
          await cancelOrderMutation.mutateAsync({
            orderId: order.id,
            reasonId: data.reasonId,
            notes: data.notes || undefined,
          });
        } catch (error: unknown) {
          console.error('Failed to cancel order:', error);
          toast.error(cancelErrorMessageOf(error));
          return false;
        }

        await completeAndAdvance('تم إلغاء الطلب بنجاح');
        return true;
      }),
    [order.id, cancelOrderMutation, runTransition, completeAndAdvance]
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
    async (label: string): Promise<boolean> =>
      runTransition(async () => {
        try {
          await updateOrderMutation.mutateAsync({
            orderId: order.id,
            data: {
              status: 'ATTEMPTED',
              eventNote: label,
            },
          });
        } catch (error: unknown) {
          toast.error(
            getApiErrorMessage(
              error,
              'فشل في تسجيل المتابعة. يرجى المحاولة مرة أخرى.'
            )
          );
          return false;
        }

        await completeAndAdvance(`تم تسجيل المتابعة: ${label}`);
        return true;
      }),
    [order.id, updateOrderMutation, runTransition, completeAndAdvance]
  );

  const handleUpdateShipping = useCallback(
    async (data: ShippingData) => {
      const pickChanged =
        (data.governorateOption ?? null) !== (order.governorateOption ?? null) ||
        (data.cityOption ?? null) !== (order.cityOption ?? null);
      const companyChanged =
        (data.shippingCompanyId ?? null) !== (order.shippingCompanyId ?? null);
      const sendPick = (pickChanged || companyChanged) && !!data.governorateOption;

      try {
        // Send flat object (not nested in customers)
        await updateOrderMutation.mutateAsync({
          orderId: order.id,
          data: {
            ...(companyChanged && { shippingCompanyId: data.shippingCompanyId ?? null }),
            ...(sendPick && {
              governorateOption: data.governorateOption,
              ...(data.cityOption && { cityOption: data.cityOption }),
            }),
            address: data.address,
            returnShippingCost: data.returnShippingCost,
            ...(data.availableFrom && { availableFrom: data.availableFrom }),
            ...(data.availableTo && { availableTo: data.availableTo }),
          },
        });

        toast.success('تم تحديث بيانات الشحن بنجاح');
      } catch (error: unknown) {
        toast.error(
          locationSaveErrorTextOf(
            error,
            'فشل في تحديث بيانات الشحن. يرجى المحاولة مرة أخرى.'
          )
        );
        throw error;
      }
    },
    [
      order.id,
      order.shippingCompanyId,
      order.governorateOption,
      order.cityOption,
      updateOrderMutation,
    ]
  );

  const handleAddPackagingNote = useCallback(
    async (note: string) => {
      if (!note.trim()) return;

      try {
        const updatedNotes = order.packagingNotes
          ? `${order.packagingNotes}\n${note}`
          : note;

        await updateOrderMutation.mutateAsync({
          orderId: order.id,
          data: {
            packagingNotes: updatedNotes,
          },
        });

        toast.success('تم تحديث ملاحظات التغليف بنجاح');
      } catch (error: unknown) {
        toast.error(
          getApiErrorMessage(
            error,
            'فشل في تحديث ملاحظات التغليف. يرجى المحاولة مرة أخرى.'
          )
        );
        throw error;
      }
    },
    [order.id, order.packagingNotes, updateOrderMutation]
  );

  return {
    isTransitioning: transitionCount > 0,
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
