'use client';

import React from 'react';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { PRODUCT_EDIT_LIMITS } from '../../types/products';
import { CompactField } from '../CompactField';
import { type SpecRow, type SpecErrors, nextKey } from './editorModel';

interface SpecificationsEditorProps {
  rows: SpecRow[];
  onChange: (rows: SpecRow[]) => void;
  errors: SpecErrors;
  showErrors: boolean;
  disabled?: boolean;
}

export function SpecificationsEditor({
  rows,
  onChange,
  errors,
  showErrors,
  disabled = false,
}: SpecificationsEditorProps) {
  const update = (key: string, patch: Partial<SpecRow>) =>
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-3">
          لا توجد مواصفات بعد، مثل الخامة: قطن
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, index) => {
            const error = showErrors ? errors.byKey[row.key] : undefined;
            return (
              <li
                key={row.key}
                className="rounded-lg border border-gray-200 bg-gray-50/50 p-3"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] gap-2 items-end">
                  <CompactField
                    label={`اسم المواصفة ${index + 1}`}
                    placeholder="مثلاً: الخامة"
                    value={row.name}
                    maxLength={PRODUCT_EDIT_LIMITS.specificationName}
                    disabled={disabled}
                    onChange={(e) => update(row.key, { name: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="touch"
                    className="text-red-500 hover:bg-red-50 sm:order-last"
                    disabled={disabled}
                    onClick={() =>
                      onChange(rows.filter((item) => item.key !== row.key))
                    }
                    aria-label={`حذف المواصفة ${row.name || index + 1}`}
                  >
                    <LiaTimesSolid className="w-5 h-5" />
                  </Button>
                  <CompactField
                    label={`القيمة ${index + 1}`}
                    placeholder="مثلاً: قطن"
                    value={row.value}
                    maxLength={PRODUCT_EDIT_LIMITS.specificationValue}
                    disabled={disabled}
                    className="col-span-2 sm:col-span-1"
                    onChange={(e) => update(row.key, { value: e.target.value })}
                  />
                </div>
                {error && (
                  <p role="alert" className="mt-2 text-xs text-red-500">
                    {error}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {showErrors && errors.section && (
        <p className="text-sm text-red-500">{errors.section}</p>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-10 border-dashed text-primary hover:bg-primary hover:text-white"
        disabled={disabled || rows.length >= PRODUCT_EDIT_LIMITS.specifications}
        onClick={() =>
          onChange([...rows, { key: nextKey('spec'), name: '', value: '' }])
        }
      >
        <LiaPlusSolid className="w-5 h-5" />
        إضافة مواصفة
      </Button>
    </div>
  );
}
