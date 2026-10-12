'use client';

import React from 'react';
import { LiaPlusSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { PRODUCT_CREATE_LIMITS } from '../../types/products';
import { AttributeChipsEditor } from '../AttributeChipsEditor';
import {
  type AttributeDraft,
  type AttributeErrors,
  nextKey,
} from './editorModel';

interface AttributesEditorProps {
  attributes: AttributeDraft[];
  onChange: (attributes: AttributeDraft[]) => void;
  errors: AttributeErrors;
  showErrors: boolean;
  displayNames: Map<number, string>;
  disabled?: boolean;
}

export function AttributesEditor({
  attributes,
  onChange,
  errors,
  showErrors,
  displayNames,
  disabled = false,
}: AttributesEditorProps) {
  const update = (key: string, patch: (attribute: AttributeDraft) => AttributeDraft) =>
    onChange(attributes.map((attribute) => (attribute.key === key ? patch(attribute) : attribute)));

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        الخصائص مثل المقاس واللون. اضغط على قيمة لتعديل اسمها. حذف قيمة أو خاصية لا يحذف المتغيرات المرتبطة بها.
      </p>
      {attributes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-3">
          لا توجد خصائص لهذا المنتج
        </p>
      ) : (
        attributes.map((attribute) => {
          const displayName =
            attribute.id !== undefined ? displayNames.get(attribute.id) : undefined;
          const entry = showErrors ? errors.byKey[attribute.key] : undefined;
          return (
            <AttributeChipsEditor
              key={attribute.key}
              name={attribute.name}
              onNameChange={(name) =>
                update(attribute.key, (current) => ({ ...current, name }))
              }
              values={attribute.options.map((option) => option.name)}
              onAddValue={(value) =>
                update(attribute.key, (current) => ({
                  ...current,
                  options: [
                    ...current.options,
                    { key: nextKey('option'), name: value },
                  ],
                }))
              }
              onRemoveValue={(index) =>
                update(attribute.key, (current) => ({
                  ...current,
                  options: current.options.filter((_, i) => i !== index),
                }))
              }
              onRenameValue={(index, value) =>
                update(attribute.key, (current) => ({
                  ...current,
                  options: current.options.map((option, i) =>
                    i === index ? { ...option, name: value } : option,
                  ),
                }))
              }
              onRemove={() =>
                onChange(attributes.filter((item) => item.key !== attribute.key))
              }
              maxValues={PRODUCT_CREATE_LIMITS.optionsPerAttribute}
              nameError={entry?.name}
              valuesError={entry?.values}
              nameHint={
                displayName && displayName !== attribute.name
                  ? `مرتبط بالاسم الموحد: ${displayName}`
                  : undefined
              }
              namePlaceholder="اسم الخاصية (مثلاً: المقاس)"
              nameLabel="اسم الخاصية"
              removeLabel={`حذف الخاصية ${attribute.name}`}
              disabled={disabled}
            />
          );
        })
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-10 border-dashed text-primary hover:bg-primary hover:text-white"
        disabled={disabled || attributes.length >= PRODUCT_CREATE_LIMITS.attributes}
        onClick={() =>
          onChange([
            ...attributes,
            { key: nextKey('attribute'), name: '', options: [] },
          ])
        }
      >
        <LiaPlusSolid className="w-5 h-5" />
        إضافة خاصية
      </Button>
    </div>
  );
}
