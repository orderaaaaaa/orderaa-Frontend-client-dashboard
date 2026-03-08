import { useState, useCallback } from 'react';
import { useUpdateCustomer } from '@/services/orders';
import { toast } from 'react-toastify';

/**
 * Options for usePhoneNumbers hook
 */
export interface UsePhoneNumbersOptions {
  customerId: number;
  orderId: number;
  initialPhones: string[];
  onUpdate?: (phoneNumbers: string[]) => void;
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
 *   initialPhones: order.customers.phoneNumbers,
 *   onUpdate: (phoneNumbers) => { ... }
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
  const updateCustomerMutation = useUpdateCustomer();

  // Initialize phone list from array
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(
    initialPhones.filter(Boolean)
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
        await updateCustomerMutation.mutateAsync({
          customerId,
          data: {
            phoneNumbers: updatedPhones,
          },
        });

        if (onUpdate) {
          onUpdate(updatedPhones);
        }
      } catch (error) {
        const message =
          error instanceof Error && 'response' in error
            ? (error as any).response?.data?.message
            : null;
        toast.error(message || 'فشل في تحديث أرقام الهاتف');
        setPhoneNumbers(phoneNumbers);
      }
    },
    [customerId, phoneNumbers, onUpdate, updateCustomerMutation]
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
      await updateCustomerMutation.mutateAsync({
        customerId,
        data: {
          phoneNumbers: updatedPhones,
        },
      });

      if (onUpdate) {
        onUpdate(updatedPhones);
      }
    } catch (error) {
      const message =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message
          : null;
      toast.error(message || 'فشل في تحديث أرقام الهاتف');
      setPhoneNumbers(phoneNumbers);
    }
  }, [customerId, phoneNumbers, editingIndex, newPhoneNumber, onUpdate, updateCustomerMutation]);

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
