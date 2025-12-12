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
      } catch (error) {
        console.error('Failed to update field:', error);
        toast.error('فشل في تحديث الحقل. يرجى المحاولة مرة أخرى.');
        throw error;
      }
    },
    [orderId, onOrderUpdate, updateOrderMutation]
  );

  return updateField;
}
