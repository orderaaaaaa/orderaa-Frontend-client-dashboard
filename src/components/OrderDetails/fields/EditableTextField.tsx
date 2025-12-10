import React from 'react';
import {
  LiaEditSolid,
  LiaCheckSolid,
  LiaTimesSolid,
} from 'react-icons/lia';
import { IconType } from 'react-icons';
import { useEditableField } from '@/hooks/OrderDetails/useEditableField';

/**
 * Props for EditableTextField component
 */
export interface EditableTextFieldProps {
  label: string;
  value: string | undefined;
  icon?: IconType;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
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
}: EditableTextFieldProps) {
  const field = useEditableField({
    initialValue: value,
    onSave,
  });

  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  const isEmpty = !value;
  const displayValue = isEmpty ? '-' : value;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <p className="font-bold text-[#121212]">{label}</p>
      <div className={`${tagStyle} relative overflow-hidden`}>
        {Icon && <Icon size={18} />}
        {field.isEditing ? (
          <>
            <input
              type="text"
              value={field.value}
              onChange={(e) => field.setValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 border border-[#5D24E1] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5D24E1] min-w-0 max-w-full"
              autoFocus
              style={{ maxWidth: 'calc(100% - 60px)' }}
            />
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={field.saveEdit}
                className="p-1 hover:bg-green-100 rounded transition-colors"
              >
                <LiaCheckSolid className="cursor-pointer w-4 h-4 text-green-600" />
              </button>
              <button
                onClick={field.cancelEdit}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <LiaTimesSolid className="cursor-pointer w-4 h-4 text-red-600" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-full flex items-start justify-between min-w-0">
              <p className={`${isEmpty ? 'text-red-500' : ''} truncate flex-1 min-w-0`}>
                {displayValue}
              </p>
              <button
                onClick={field.startEdit}
                className="cursor-pointer p-1 hover:bg-purple-100 rounded transition-colors flex-shrink-0"
              >
                <LiaEditSolid className="w-4 h-4 text-[#5D24E1]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
