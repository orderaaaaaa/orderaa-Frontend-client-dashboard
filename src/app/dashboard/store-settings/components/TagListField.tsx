'use client';

import { useState, type KeyboardEvent } from 'react';
import type { IconType } from 'react-icons';
import { LiaTimesSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';

export interface TagListItem {
  key: string | number;
  label: string;
}

interface TagListFieldProps {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  placeholder: string;
  items: TagListItem[];
  onAdd: (value: string) => void;
  onRemove: (item: TagListItem) => void;
  isAdding?: boolean;
  removingKey?: string | number | null;
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
}

export function TagListField({
  id,
  title,
  description,
  icon: Icon,
  placeholder,
  items,
  onAdd,
  onRemove,
  isAdding = false,
  removingKey = null,
  isLoading = false,
  error,
  disabled = false,
}: TagListFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const inputId = `${id}-input`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const trimmed = inputValue.trim();
  const isDuplicate = items.some((item) => item.label === trimmed);

  const handleAdd = () => {
    if (!trimmed || disabled || isAdding) return;
    if (!isDuplicate) onAdd(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <label
            htmlFor={inputId}
            className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-900"
          >
            {title}
          </label>
          <p id={descriptionId} className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {isLoading ? (
        <PageLoading size="sm" className="py-6 min-h-0" />
      ) : (
        <div className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 p-2 sm:p-3 focus-within:border-primary transition-colors">
          {items.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2 mb-2" aria-label={title}>
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex min-h-10 items-center gap-1 rounded-full bg-primary ps-3 pe-0.5 text-sm font-medium text-white"
                >
                  <span className="break-all">{item.label}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled || removingKey === item.key}
                    onClick={() => onRemove(item)}
                    aria-label={`حذف ${item.label}`}
                    className="size-10 sm:size-10 shrink-0 rounded-full text-white hover:bg-white/15 hover:text-white"
                  >
                    <LiaTimesSolid className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2">
            <input
              id={inputId}
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
              aria-invalid={error ? true : undefined}
              className="min-h-10 min-w-0 flex-1 rounded-lg bg-transparent px-2 text-base outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
            />
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!trimmed || disabled || isAdding}
              loading={isAdding}
              loadingText="جارٍ الإضافة..."
              className="min-h-10 shrink-0 rounded-lg px-4 text-sm font-semibold"
            >
              إضافة
            </Button>
          </div>
          {isDuplicate && trimmed && (
            <p className="mt-1 px-2 text-xs text-amber-700" role="status">
              هذه القيمة مضافة بالفعل
            </p>
          )}
        </div>
      )}

      {error && (
        <p id={errorId} className="text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
