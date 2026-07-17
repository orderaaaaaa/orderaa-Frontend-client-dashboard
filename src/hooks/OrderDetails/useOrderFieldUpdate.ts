import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useUpdateOrder } from '@/services/orders';
import type { Order } from '@/types/orders';

export type OnOrderUpdate = (updatedOrder: Order) => void;

// Custom hook for updating order fields using React Query mutation
// Automatically invalidates the order cache after successful update
export function useOrderFieldUpdate(
  orderId: number,
  onOrderUpdate?: OnOrderUpdate
) {
  const updateOrderMutation = useUpdateOrder();

  const updateField = useCallback(
    async (fieldPath: string, value: unknown) => {
      try {
        // Determine if this is a customer field or order field
        const isCustomerField = fieldPath.startsWith('customers.');

        let updateData: Record<string, unknown>;

        if (isCustomerField) {
          // Extract the customer field name
          const customerField = fieldPath.replace('customers.', '');
          updateData = {
            customers: {
              [customerField]: value,
            },
          };
        } else if (fieldPath === 'availableTime' && typeof value === 'object' && value !== null) {
          // Special case: availableTime sends both availableFrom and availableTo
          updateData = value as Record<string, unknown>;
        } else {
          // Direct order field
          updateData = {
            [fieldPath]: value,
          };
        }

        // Use the mutation - this automatically invalidates queries
        const updatedOrder = await updateOrderMutation.mutateAsync({
          orderId,
          data: updateData,
        });

        if (onOrderUpdate) {
          onOrderUpdate(updatedOrder);
        }

        toast.success('تم تحديث البيانات بنجاح');
        return updatedOrder;
      } catch (err: any) {
        const msg = err?.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل في تحديث الحقل. يرجى المحاولة مرة أخرى.');
        throw err;
      }
    },
    [orderId, onOrderUpdate, updateOrderMutation]
  );

  const updateFields = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        // Filter out undefined values — only include defined keys in the payload
        const updateData: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
          if (value !== undefined) {
            updateData[key] = value;
          }
        }

        if (Object.keys(updateData).length === 0) {
          throw new Error('No fields to update');
        }

        const updatedOrder = await updateOrderMutation.mutateAsync({
          orderId,
          data: updateData,
        });

        if (onOrderUpdate) {
          onOrderUpdate(updatedOrder);
        }

        toast.success('تم تحديث البيانات بنجاح');
        return updatedOrder;
      } catch (err: any) {
        const msg = err?.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل في تحديث الحقل. يرجى المحاولة مرة أخرى.');
        throw err;
      }
    },
    [orderId, onOrderUpdate, updateOrderMutation]
  );

  return { updateField, updateFields };
}
