import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { updateCustomer } from '@/lib/api/order';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

/**
 * Options for usePhoneNumbers hook
 */
export interface UsePhoneNumbersOptions {
  customerId: number;
  orderId: number;
  initialPhones: (string | undefined)[];
  onUpdate?: (phoneNumber: string, altPhone?: string) => void;
}

/**
 * Return type for usePhoneNumbers hook
 */
export interface PhoneNumbersState {
  phoneNumbers: string[];
  editingIndex: number | null;
  newPhoneNumber: string;
  setNewPhoneNumber: (value: string) => void;
  handleAdd: () => void;
  handleEdit: (index: number) => void;
  handleRemove: (index: number) => Promise<void>;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

/**
 * Custom hook to manage phone number CRUD operations
 *
 * @param options - Configuration options
 * @returns Phone number state and handler functions
 *
 * @example
 * const phones = usePhoneNumbers({
 *   customerId: order.customers.id,
 *   initialPhones: [order.customers.phoneNumber, order.customers.altPhone],
 *   onUpdate: (phone, altPhone) => { ... }
 * });
 *
 * // Usage: phones.phoneNumbers, phones.handleAdd(), phones.handleEdit(index), etc.
 */
export function usePhoneNumbers({
  customerId,
  orderId,
  initialPhones,
  onUpdate,
}: UsePhoneNumbersOptions): PhoneNumbersState {
  const queryClient = useQueryClient();

  // Filter out undefined/null values and create initial phone list
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(
    initialPhones.filter((phone): phone is string => Boolean(phone))
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  const handleAdd = useCallback(() => {
    setNewPhoneNumber('');
    setEditingIndex(phoneNumbers.length);
  }, [phoneNumbers.length]);

  const handleEdit = useCallback((index: number) => {
    setNewPhoneNumber(phoneNumbers[index]);
    setEditingIndex(index);
  }, [phoneNumbers]);

  const handleRemove = useCallback(
    async (index: number) => {
      const updatedPhones = phoneNumbers.filter((_, i) => i !== index);
      setPhoneNumbers(updatedPhones);

      try {
        await updateCustomer(customerId, {
          phoneNumber: updatedPhones[0] || '',
          altPhone: updatedPhones[1] || undefined,
        });

        // Invalidate order details cache to get fresh data
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.ORDER_DETAILS, orderId],
        });

        if (onUpdate) {
          onUpdate(updatedPhones[0] || '', updatedPhones[1]);
        }
      } catch (error) {
        console.error('Failed to update phone numbers:', error);
        // Revert on error
        setPhoneNumbers(phoneNumbers);
      }
    },
    [customerId, orderId, phoneNumbers, onUpdate, queryClient]
  );

  const handleSave = useCallback(async () => {
    if (!newPhoneNumber.trim()) return;

    const updatedPhones = [...phoneNumbers];
    if (editingIndex !== null) {
      if (editingIndex >= phoneNumbers.length) {
        // Adding new phone
        updatedPhones.push(newPhoneNumber);
      } else {
        // Editing existing phone
        updatedPhones[editingIndex] = newPhoneNumber;
      }
    }

    setPhoneNumbers(updatedPhones);
    setEditingIndex(null);
    setNewPhoneNumber('');

    try {
      await updateCustomer(customerId, {
        phoneNumber: updatedPhones[0] || '',
        altPhone: updatedPhones[1] || undefined,
      });

      // Invalidate order details cache to get fresh data
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDER_DETAILS, orderId],
      });

      if (onUpdate) {
        onUpdate(updatedPhones[0] || '', updatedPhones[1]);
      }
    } catch (error) {
      console.error('Failed to update phone numbers:', error);
      // Revert on error
      setPhoneNumbers(phoneNumbers);
    }
  }, [customerId, orderId, phoneNumbers, editingIndex, newPhoneNumber, onUpdate, queryClient]);

  const handleCancel = useCallback(() => {
    setEditingIndex(null);
    setNewPhoneNumber('');
  }, []);

  return {
    phoneNumbers,
    editingIndex,
    newPhoneNumber,
    setNewPhoneNumber,
    handleAdd,
    handleEdit,
    handleRemove,
    handleSave,
    handleCancel,
  };
}
