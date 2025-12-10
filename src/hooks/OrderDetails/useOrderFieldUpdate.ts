import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { updateOrder } from '@/lib/api/order';
import { Order } from '@/types/orders';

/**
 * Callback function type for order updates
 */
export type OnOrderUpdate = (updatedOrder: Order) => void;

/**
 * Custom hook for updating order fields
 *
 * @param orderId - The ID of the order to update
 * @param onOrderUpdate - Callback function called after successful update
 * @returns Update function for order fields
 *
 * @example
 * const updateField = useOrderFieldUpdate(order.id, onOrderUpdate);
 *
 * // Usage:
 * await updateField('paymentMethod', 'كاش');
 * await updateField('customers.name', 'أحمد');
 */
export function useOrderFieldUpdate(
  orderId: number,
  onOrderUpdate?: OnOrderUpdate
) {
  const updateField = useCallback(
    async (fieldPath: string, value: any) => {
      try {
        // Determine if this is a customer field or order field
        const isCustomerField = fieldPath.startsWith('customers.');

        let updateData: any;

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

        const updatedOrder = await updateOrder(orderId, updateData);

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
    [orderId, onOrderUpdate]
  );

  return updateField;
}
