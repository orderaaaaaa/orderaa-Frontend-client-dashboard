'use client';

import React, { useState } from 'react';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { duplicateNameKey } from '../utils/manualProduct';

export interface AttributeChipsEditorProps {
  name: string;
  onNameChange: (name: string) => void;
  values: string[];
  onAddValue: (value: string) => void;
  onRemoveValue: (index: number) => void;
  onRenameValue?: (index: number, value: string) => void;
  onRemove: () => void;
  maxValues: number;
  nameError?: string;
  valuesError?: string;
  nameHint?: string;
  namePlaceholder?: string;
  nameLabel?: string;
  removeLabel?: string;
  disabled?: boolean;
}

export function AttributeChipsEditor({
  name,
  onNameChange,
  values,
  onAddValue,
  onRemoveValue,
  onRenameValue,
  onRemove,
  maxValues,
  nameError,
  valuesError,
  nameHint,
  namePlaceholder = 'اسم المتغير (مثلاً: المقاس)',
  nameLabel = 'اسم المتغير',
  removeLabel = 'حذف المتغير',
  disabled = false,
}: AttributeChipsEditorProps) {
  const [draft, setDraft] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const isTaken = (value: string, exceptIndex?: number) => {
    const key = duplicateNameKey(value);
    return values.some(
      (existing, index) =>
        index !== exceptIndex && duplicateNameKey(existing) === key,
    );
  };

  const addValue = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (isTaken(trimmed)) {
      setDraftError(`القيمة "${trimmed}" موجودة بالفعل`);
      setDraft('');
      return;
    }
    if (values.length >= maxValues) {
      setDraftError(`الحد الأقصى ${maxValues} قيمة لكل متغير`);
      return;
    }
    setDraftError(null);
    onAddValue(trimmed);
    setDraft('');
  };

  const removeValue = (index: number) => {
    setDraftError(null);
    onRemoveValue(index);
  };

  const startRename = (index: number) => {
    if (!onRenameValue || disabled) return;
    setEditingIndex(index);
    setEditingText(values[index]);
  };

  const commitRename = () => {
    if (editingIndex === null || !onRenameValue) return;
    const trimmed = editingText.trim();
    if (trimmed && trimmed !== values[editingIndex]) {
      if (isTaken(trimmed, editingIndex)) {
        setDraftError(`القيمة "${trimmed}" موجودة بالفعل`);
      } else {
        setDraftError(null);
        onRenameValue(editingIndex, trimmed);
      }
    }
    setEditingIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValue();
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      e.preventDefault();
      removeValue(values.length - 1);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingIndex(null);
    }
  };

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 hover:border-primary/40 transition-colors">
      <span
        aria-hidden
        className="absolute inset-y-0 start-0 w-1 bg-primary rounded-s-lg"
      />
      <div className="ps-5 pe-2 py-3">
        <div className="flex items-center gap-2 mb-2">
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={namePlaceholder}
            aria-label={nameLabel}
            aria-invalid={!!nameError}
            disabled={disabled}
            className="flex-1 min-w-0 min-h-10 text-base font-semibold bg-transparent border-0 border-b border-transparent focus:border-primary focus:outline-none px-0 py-1 placeholder:font-normal placeholder:text-gray-400"
          />
          <Button
            type="button"
            variant="ghost"
            size="touch"
            onClick={onRemove}
            disabled={disabled}
            className="text-red-500 hover:bg-red-50 shrink-0"
            aria-label={removeLabel}
          >
            <LiaTimesSolid className="w-5 h-5" />
          </Button>
        </div>
        {nameHint && (
          <p className="mb-2 text-xs text-gray-400">{nameHint}</p>
        )}
        {nameError && <p className="text-red-500 text-xs mb-2">{nameError}</p>}

        <div className="flex flex-wrap items-center gap-2">
          {values.map((value, valueIndex) =>
            editingIndex === valueIndex ? (
              <input
                key={`edit-${valueIndex}`}
                autoFocus
                type="text"
                value={editingText}
                aria-label={`تعديل ${value}`}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                onBlur={commitRename}
                className="min-h-10 sm:min-h-9 rounded-full border border-primary/40 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-40"
              />
            ) : (
              <span
                key={`${value}-${valueIndex}`}
                className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary ps-1 pe-0.5 min-h-10 sm:min-h-9 text-sm font-medium max-w-full"
              >
                {onRenameValue ? (
                  <button
                    type="button"
                    onClick={() => startRename(valueIndex)}
                    disabled={disabled}
                    className="inline-flex items-center min-w-10 min-h-10 sm:min-h-9 px-2 rounded-full break-words text-start cursor-text hover:bg-primary/10"
                    aria-label={`تعديل ${value}`}
                  >
                    {value}
                  </button>
                ) : (
                  <span className="min-w-0 break-words px-2">{value}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeValue(valueIndex)}
                  disabled={disabled}
                  className="inline-flex items-center justify-center size-10 sm:size-9 shrink-0 rounded-full text-primary/70 hover:text-primary hover:bg-primary/10 cursor-pointer"
                  aria-label={`حذف ${value}`}
                >
                  <LiaTimesSolid className="w-3.5 h-3.5" />
                </button>
              </span>
            ),
          )}

          {isAdding ? (
            <input
              autoFocus
              type="text"
              value={draft}
              aria-label="قيمة جديدة"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                addValue();
                setIsAdding(false);
              }}
              placeholder="اكتب القيمة..."
              className="min-h-10 sm:min-h-9 rounded-full border border-primary/40 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-40"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gray-400 text-gray-600 hover:border-primary hover:text-primary px-3 min-h-10 sm:min-h-9 text-sm cursor-pointer transition-colors disabled:opacity-50"
            >
              <LiaPlusSolid className="w-3.5 h-3.5" />
              إضافة قيمة
            </button>
          )}
        </div>

        {(draftError || valuesError) && (
          <p className="text-red-500 text-xs mt-2">{draftError ?? valuesError}</p>
        )}
      </div>
    </div>
  );
}
