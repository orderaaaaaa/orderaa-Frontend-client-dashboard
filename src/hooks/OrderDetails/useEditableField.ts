import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface UseEditableFieldOptions {
  initialValue: string | undefined;
  onSave: (value: string) => Promise<void>;
  validationSchema?: z.ZodSchema<string>;
}

export interface EditableFieldState {
  isEditing: boolean;
  value: string;
  error: string | null;
  startEdit: () => void;
  cancelEdit: () => void;
  saveEdit: () => Promise<void>;
  setValue: (value: string) => void;
  validate: (value: string) => boolean;
}

export function useEditableField({
  initialValue,
  onSave,
  validationSchema,
}: UseEditableFieldOptions): EditableFieldState {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue || '');
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((val: string): boolean => {
    if (!validationSchema) return true;

    const result = validationSchema.safeParse(val);
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'قيمة غير صالحة');
      return false;
    }
    setError(null);
    return true;
  }, [validationSchema]);

  const handleSetValue = useCallback((val: string) => {
    setValue(val);
    if (validationSchema) {
      validate(val);
    }
  }, [validationSchema, validate]);

  const startEdit = useCallback(() => {
    setValue(initialValue || '');
    setError(null);
    setIsEditing(true);
  }, [initialValue]);

  const cancelEdit = useCallback(() => {
    setValue(initialValue || '');
    setError(null);
    setIsEditing(false);
  }, [initialValue]);

  const saveEdit = useCallback(async () => {
    if (validationSchema && !validate(value)) {
      return;
    }

    try {
      await onSave(value);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      // Error handling is done in onSave callback
      // Don't close edit mode on error
      throw err;
    }
  }, [value, onSave, validationSchema, validate]);

  return {
    isEditing,
    value,
    error,
    startEdit,
    cancelEdit,
    saveEdit,
    setValue: handleSetValue,
    validate,
  };
}
