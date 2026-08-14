import React from 'react';
import {
  LiaEditSolid,
  LiaCheckSolid,
  LiaTimesSolid,
} from 'react-icons/lia';
import { IconType } from 'react-icons';
import { z } from 'zod';
import { useEditableField } from '@/hooks/OrderDetails/useEditableField';
import { Button } from '@/components/ui/button';

/**
 * Props for EditableTextField component
 */
export interface EditableTextFieldProps {
  label: string;
  value: string | null | undefined;
  icon?: IconType;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  inputType?: 'text' | 'number';
  validationSchema?: z.ZodSchema<string>;
  /**
   * When false the value is rendered read-only (no edit affordance). Callers
   * pass the result of the ABAC permission check that gates the save endpoint.
   */
  canEdit?: boolean;
}

/**
 * EditableTextField Component
 *
 * Displays a field that can be edited inline with save/cancel buttons
 *
 * @param props - Component props
 */
export function EditableTextField({
  label,
  value,
  icon: Icon,
  onSave,
  placeholder,
  className = '',
  multiline = false,
  inputType = 'text',
  validationSchema,
  canEdit = true,
}: EditableTextFieldProps) {
  const field = useEditableField({
    initialValue: value,
    onSave,
    validationSchema,
  });

  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  const isEmpty = !value;
  const displayValue = isEmpty ? '-' : value;

  return (
    <div className={`flex flex-col gap-1 min-w-0 overflow-hidden ${className}`}>
      <p className="font-bold text-[#121212]">{label}</p>
      <div className={`${tagStyle} relative w-full overflow-hidden`}>
        {Icon && <Icon size={18} className="flex-shrink-0 self-start mt-1" />}
        {field.isEditing && canEdit ? (
          <div className={`flex ${multiline ? 'flex-col' : 'flex-col'} gap-1 flex-1 min-w-0 w-full overflow-hidden`}>
            <div className={`flex ${multiline ? 'flex-col' : 'items-center'} gap-1`}>
              {multiline ? (
                <textarea
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  placeholder={placeholder}
                  className={`flex-1 min-w-0 w-full border rounded px-2 py-1 text-base focus:outline-none focus:ring-1 min-h-[200px] resize-y ${field.error
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-primary focus:ring-primary'
                    }`}
                  autoFocus
                />
              ) : (
                <input
                  type={inputType === 'number' ? 'text' : 'text'}
                  inputMode={inputType === 'number' ? 'numeric' : 'text'}
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  placeholder={placeholder}
                  className={`flex-1 min-w-0 w-full border rounded px-2 py-1 text-base focus:outline-none focus:ring-1 ${field.error
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-primary focus:ring-primary'
                    }`}
                  autoFocus
                />
              )}
              <div className={`flex gap-1 ${multiline ? 'self-end' : 'flex-shrink-0'}`}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={field.saveEdit}
                  disabled={!!field.error}
                  className="p-1 hover:bg-green-100 rounded"
                >
                  <LiaCheckSolid className="w-4 h-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={field.cancelEdit}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <LiaTimesSolid className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
            {field.error && (
              <span className="text-red-500 text-xs">{field.error}</span>
            )}
          </div>
        ) : (
          <div className="w-full flex items-start justify-between min-w-0 overflow-hidden">
            <p className={`${isEmpty ? 'text-red-500' : ''} whitespace-pre-wrap break-words flex-1 min-w-0`}>
              {displayValue}
            </p>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={field.startEdit}
                className="p-1 hover:bg-purple-100 rounded flex-shrink-0"
              >
                <LiaEditSolid className="w-4 h-4 text-primary" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
