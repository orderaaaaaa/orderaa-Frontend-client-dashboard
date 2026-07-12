'use client';

import React, { useEffect, useState } from 'react';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
  Control,
  UseFormSetValue,
  UseFormRegister,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { MultiImageUploadField } from '@/components/ui/multi-image-upload-field';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const addProductSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  price: z.coerce
    .number({ invalid_type_error: 'السعر مطلوب' })
    .positive('السعر مطلوب ويجب أن يكون أكبر من 0'),
  sku: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  images: z
    .array(z.instanceof(File))
    .min(1, 'يجب رفع صورة واحدة على الأقل')
    .default([]),
  variantOptions: z
    .array(
      z.object({
        attribute: z.string().min(1, 'اسم المتغير مطلوب'),
        options: z
          .array(z.string().min(1))
          .min(1, 'يجب إضافة قيمة واحدة على الأقل'),
      }),
    )
    .default([]),
});

type AddProductFormData = z.infer<typeof addProductSchema>;

const emptyDefaults: AddProductFormData = {
  name: '',
  price: undefined as unknown as number,
  sku: '',
  category: '',
  description: '',
  images: [],
  variantOptions: [],
};

interface VariantEditorProps {
  index: number;
  control: Control<AddProductFormData>;
  setValue: UseFormSetValue<AddProductFormData>;
  register: UseFormRegister<AddProductFormData>;
  labelError?: string;
  valuesError?: string;
  onRemove: () => void;
}

function VariantEditor({
  index,
  control,
  setValue,
  register,
  labelError,
  valuesError,
  onRemove,
}: VariantEditorProps) {
  const values = useWatch({
    control,
    name: `variantOptions.${index}.options`,
  }) as string[] | undefined;
  const currentValues = values ?? [];
  const [draft, setDraft] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addValue = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (currentValues.includes(trimmed)) {
      setDraft('');
      return;
    }
    setValue(`variantOptions.${index}.options`, [...currentValues, trimmed], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setDraft('');
  };

  const removeValue = (valueIndex: number) => {
    setValue(
      `variantOptions.${index}.options`,
      currentValues.filter((_, i) => i !== valueIndex),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValue();
    } else if (e.key === 'Backspace' && draft === '' && currentValues.length > 0) {
      e.preventDefault();
      removeValue(currentValues.length - 1);
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
            {...register(`variantOptions.${index}.attribute`)}
            placeholder="اسم المتغير (مثلاً: المقاس)"
            className="flex-1 text-base font-semibold bg-transparent border-0 border-b border-transparent focus:border-primary focus:outline-none px-0 py-1 placeholder:font-normal placeholder:text-gray-400"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-red-500 hover:bg-red-50 shrink-0"
            aria-label="حذف المتغير"
          >
            <LiaTimesSolid className="w-5 h-5" />
          </Button>
        </div>
        {labelError && <p className="text-red-500 text-xs mb-2">{labelError}</p>}

        <div className="flex flex-wrap items-center gap-2">
          {currentValues.map((value, valueIndex) => (
            <span
              key={`${value}-${valueIndex}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium"
            >
              <span>{value}</span>
              <button
                type="button"
                onClick={() => removeValue(valueIndex)}
                className="text-primary/70 hover:text-primary cursor-pointer"
                aria-label={`حذف ${value}`}
              >
                <LiaTimesSolid className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {isAdding ? (
            <input
              autoFocus
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                addValue();
                setIsAdding(false);
              }}
              placeholder="اكتب القيمة..."
              className="h-8 rounded-full border border-primary/40 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-40"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gray-400 text-gray-600 hover:border-primary hover:text-primary px-3 py-1 text-sm cursor-pointer transition-colors"
            >
              <LiaPlusSolid className="w-3.5 h-3.5" />
              إضافة قيمة
            </button>
          )}
        </div>

        {valuesError && (
          <p className="text-red-500 text-xs mt-2">{valuesError}</p>
        )}
      </div>
    </div>
  );
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
}) => {
  const form = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: emptyDefaults,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variantOptions',
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset(emptyDefaults);
    }
  }, [isOpen, form]);

  const onSubmit = form.handleSubmit((data) => {
    const images = data.images ?? [];

    const payload = {
      name: data.name.trim(),
      price: data.price,
      sku: data.sku?.trim() || undefined,
      category: data.category?.trim() || undefined,
      description: data.description?.trim() || undefined,
      image: images[0],
      images: images.length > 0 ? images : undefined,
      variantOptions: data.variantOptions
        .map((v) => ({
          attribute: v.attribute.trim(),
          options: v.options.map((s) => s.trim()).filter(Boolean),
        }))
        .filter((v) => v.attribute && v.options.length > 0),
    };

    console.log('New product:', payload);
    toast.success('تم حفظ المنتج (وضع المعاينة - لا يوجد خادم)');
    onClose();
  });

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة منتج يدوياً"
      showFooter={false}
      maxWidth="md:max-w-2xl"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          register={form.register}
          name="name"
          label="اسم المنتج"
          required
          placeholder="أدخل اسم المنتج..."
          error={form.formState.errors.name?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            register={form.register}
            name="price"
            label="السعر"
            required
            type="number"
            placeholder="0"
            min={0}
            error={form.formState.errors.price?.message}
          />
          <Input
            register={form.register}
            name="sku"
            label="SKU"
            placeholder="أدخل رمز المنتج..."
            error={form.formState.errors.sku?.message}
          />
        </div>

        <Input
          register={form.register}
          name="category"
          label="الفئة"
          placeholder="أدخل فئة المنتج..."
          error={form.formState.errors.category?.message}
        />

        <Controller
          control={form.control}
          name="images"
          render={({ field, fieldState }) => (
            <MultiImageUploadField
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              title="صور المنتج"
              description="قم برفع صور المنتج (يمكنك اختيار أكثر من صورة)"
              required
            />
          )}
        />

        <Textarea
          register={form.register}
          name="description"
          label="الوصف"
          placeholder="أدخل وصف المنتج..."
        />

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between pt-3">
            <label className="text-[18px]">المتغيرات</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({ attribute: '', options: [] })}
              className="text-primary font-semibold hover:bg-primary hover:text-white"
            >
              <LiaPlusSolid className="w-4 h-4" />
              إضافة متغير
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">
              لم يتم إضافة أي متغيرات بعد
            </p>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <VariantEditor
                  key={field.id}
                  index={index}
                  control={form.control}
                  setValue={form.setValue}
                  register={form.register}
                  labelError={
                    form.formState.errors.variantOptions?.[index]?.attribute?.message
                  }
                  valuesError={
                    form.formState.errors.variantOptions?.[index]?.options?.message
                  }
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            حفظ المنتج
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddProductModal;
