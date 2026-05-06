'use client';

import React, { useEffect } from 'react';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  images: z.array(z.instanceof(File)).optional().default([]),
  variantOptions: z.array(
    z.object({
      label: z.string(),
      values: z.string(),
    })
  ),
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
          label: v.label.trim(),
          values: v.values
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }))
        .filter((v) => v.label && v.values.length > 0),
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
              onClick={() => append({ label: '', values: '' })}
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
            fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <div className="grid grid-cols-[1fr_2fr] gap-3 flex-1">
                  <Input
                    register={form.register}
                    name={`variantOptions.${index}.label`}
                    placeholder="الاسم (مثلاً: المقاس)"
                  />
                  <Input
                    register={form.register}
                    name={`variantOptions.${index}.values`}
                    placeholder="القيم مفصولة بفاصلة (S, M, L)"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:bg-red-50 mt-1"
                >
                  <LiaTimesSolid className="w-5 h-5" />
                </Button>
              </div>
            ))
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
