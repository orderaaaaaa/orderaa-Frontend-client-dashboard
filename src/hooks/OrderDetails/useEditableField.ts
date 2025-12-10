import { useState, useCallback } from 'react';

export interface UseEditableFieldOptions {
  initialValue: string | undefined;
  onSave: (value: string) => Promise<void>;
}

export interface EditableFieldState {
  isEditing: boolean;
  value: string;
  startEdit: () => void;
  cancelEdit: () => void;
  saveEdit: () => Promise<void>;
  setValue: (value: string) => void;
}

export function useEditableField({
  initialValue,
  onSave,
}: UseEditableFieldOptions): EditableFieldState {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue || '');

  const startEdit = useCallback(() => {
    setValue(initialValue || '');
    setIsEditing(true);
  }, [initialValue]);

  const cancelEdit = useCallback(() => {
    setValue(initialValue || '');
    setIsEditing(false);
  }, [initialValue]);

  const saveEdit = useCallback(async () => {
    try {
      await onSave(value);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in onSave callback
      // Don't close edit mode on error
      throw error;
    }
  }, [value, onSave]);

  return {
    isEditing,
    value,
    startEdit,
    cancelEdit,
    saveEdit,
    setValue,
  };
}
