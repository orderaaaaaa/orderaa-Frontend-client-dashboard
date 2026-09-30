'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { MultiImageUploadField } from '@/components/ui/multi-image-upload-field';
import { uploadFile } from '@/lib/api/upload';
import { useCreateProduct } from '../../hooks/useProduct';
import { PRODUCT_CREATE_LIMITS } from '../../types/products';
import {
  buildCreateProductPayload,
  cleanAttributes,
  combinationCount,
  duplicateNameKey,
  duplicateNames,
  repeatedValues,
  variantCombinations,
  variantRowKey,
  type VariantRowEdit,
} from '../../utils/manualProduct';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const addProductSchema = z.object({
  name: z.string().trim().min(1, 'اسم المنتج مطلوب'),
  price: z.coerce
    .number({ invalid_type_error: 'السعر مطلوب' })
    .positive('السعر مطلوب ويجب أن يكون أكبر من 0'),
  sku: z.string().optional(),
  images: z.array(z.instanceof(File)).default([]),
  attributes: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'اسم المتغير مطلوب'),
        options: z
          .array(z.string().trim().min(1))
          .min(1, 'يجب إضافة قيمة واحدة على الأقل')
          .max(
            PRODUCT_CREATE_LIMITS.optionsPerAttribute,
            `الحد الأقصى ${PRODUCT_CREATE_LIMITS.optionsPerAttribute} قيمة لكل متغير`,
          ),
      }),
    )
    .max(
      PRODUCT_CREATE_LIMITS.attributes,
      `الحد الأقصى ${PRODUCT_CREATE_LIMITS.attributes} متغيرات`,
    )
    .default([])
    .superRefine((attributes, ctx) => {
      const repeated = new Set(
        duplicateNames(attributes.map((attribute) => attribute.name)).map(
          duplicateNameKey,
        ),
      );
      attributes.forEach((attribute, index) => {
        if (repeated.has(duplicateNameKey(attribute.name))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'name'],
            message: 'اسم المتغير مكرر',
          });
        }
        const repeatedOptions = duplicateNames(attribute.options);
        if (repeatedOptions.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'options'],
            message: `قيم مكررة: ${repeatedOptions.join('، ')}`,
          });
        }
      });
      if (combinationCount(attributes) > PRODUCT_CREATE_LIMITS.variants) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `الحد الأقصى ${PRODUCT_CREATE_LIMITS.variants} صف متغيرات`,
        });
      }
    }),
});

type AddProductFormData = z.infer<typeof addProductSchema>;

const emptyDefaults: AddProductFormData = {
  name: '',
  price: undefined as unknown as number,
  sku: '',
  images: [],
  attributes: [],
};

interface AttributeEditorProps {
  index: number;
  control: Control<AddProductFormData>;
  setValue: UseFormSetValue<AddProductFormData>;
  register: UseFormRegister<AddProductFormData>;
  labelError?: string;
  valuesError?: string;
  onRemove: () => void;
}

function AttributeEditor({
  index,
  control,
  setValue,
  register,
  labelError,
  valuesError,
  onRemove,
}: AttributeEditorProps) {
  const values = useWatch({
    control,
    name: `attributes.${index}.options`,
  }) as string[] | undefined;
  const currentValues = values ?? [];
  const [draft, setDraft] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const addValue = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const key = duplicateNameKey(trimmed);
    if (currentValues.some((value) => duplicateNameKey(value) === key)) {
      setDraftError(`القيمة "${trimmed}" موجودة بالفعل`);
      setDraft('');
      return;
    }
    if (currentValues.length >= PRODUCT_CREATE_LIMITS.optionsPerAttribute) {
      setDraftError(
        `الحد الأقصى ${PRODUCT_CREATE_LIMITS.optionsPerAttribute} قيمة لكل متغير`,
      );
      return;
    }
    setDraftError(null);
    setValue(`attributes.${index}.options`, [...currentValues, trimmed], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setDraft('');
  };

  const removeValue = (valueIndex: number) => {
    setDraftError(null);
    setValue(
      `attributes.${index}.options`,
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
            {...register(`attributes.${index}.name`)}
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

        {(draftError || valuesError) && (
          <p className="text-red-500 text-xs mt-2">{draftError ?? valuesError}</p>
        )}
      </div>
    </div>
  );
}

interface VariantRowsProps {
  control: Control<AddProductFormData>;
  edits: Record<string, VariantRowEdit>;
  onEdit: (key: string, edit: VariantRowEdit) => void;
}

function VariantRows({ control, edits, onEdit }: VariantRowsProps) {
  const watchedAttributes = useWatch({ control, name: 'attributes' });
  const watchedPrice = useWatch({ control, name: 'price' });
  const productPrice = Number(watchedPrice);

  const attributes = useMemo(
    () =>
      cleanAttributes(watchedAttributes ?? []).filter(
        (attribute) => attribute.name !== '' && attribute.options.length > 0,
      ),
    [watchedAttributes],
  );
  const count = combinationCount(attributes);
  const rows = useMemo(
    () =>
      count > PRODUCT_CREATE_LIMITS.variants ? [] : variantCombinations(attributes),
    [attributes, count],
  );

  if (count > PRODUCT_CREATE_LIMITS.variants) {
    return (
      <p className="text-red-500 text-sm">
        {`عدد صفوف المتغيرات ${count} أكبر من الحد الأقصى ${PRODUCT_CREATE_LIMITS.variants}، قلل عدد القيم`}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((options) => {
        const key = variantRowKey(options);
        const edit = edits[key] ?? {};
        const label =
          options.length === 0
            ? 'المنتج بدون متغيرات'
            : options.map((pair) => pair.option).join(' / ');
        return (
          <div
            key={key}
            className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center rounded-lg border border-gray-200 bg-white p-3"
          >
            <span className="text-sm font-semibold text-gray-800">{label}</span>
            <Input
              placeholder="SKU"
              value={edit.sku ?? ''}
              onChange={(e) => onEdit(key, { ...edit, sku: e.target.value })}
            />
            <Input
              placeholder="الباركود"
              value={edit.barcode ?? ''}
              onChange={(e) => onEdit(key, { ...edit, barcode: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="السعر"
              value={
                edit.price ??
                (Number.isFinite(productPrice) && productPrice > 0
                  ? String(productPrice)
                  : '')
              }
              onChange={(e) => onEdit(key, { ...edit, price: e.target.value })}
            />
          </div>
        );
      })}
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
  const [rowEdits, setRowEdits] = useState<Record<string, VariantRowEdit>>({});
  const [isSaving, setIsSaving] = useState(false);
  const createProduct = useCreateProduct();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attributes',
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset(emptyDefaults);
      setRowEdits({});
    }
  }, [isOpen, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    const draftPayload = buildCreateProductPayload(data, rowEdits, []);

    const badPrice = draftPayload.variants.find(
      (variant) =>
        variant.price === undefined ||
        !Number.isFinite(variant.price) ||
        variant.price < 0,
    );
    if (badPrice) {
      toast.error('سعر المتغير يجب أن يكون رقماً أكبر من أو يساوي 0');
      return;
    }
    const repeatedSkus = repeatedValues(
      draftPayload.variants.map((variant) => variant.sku),
    );
    if (repeatedSkus.length > 0) {
      toast.error(`رمز SKU مكرر بين صفوف المتغيرات: ${repeatedSkus.join('، ')}`);
      return;
    }
    const repeatedBarcodes = repeatedValues(
      draftPayload.variants.map((variant) => variant.barcode),
    );
    if (repeatedBarcodes.length > 0) {
      toast.error(
        `الباركود مكرر بين صفوف المتغيرات: ${repeatedBarcodes.join('، ')}`,
      );
      return;
    }

    setIsSaving(true);
    try {
      let imageUrls: string[];
      try {
        const uploads = await Promise.all(data.images.map(uploadFile));
        imageUrls = uploads.map((upload) => upload.url);
      } catch {
        toast.error('تعذر رفع الصور، حاول مرة أخرى');
        return;
      }
      await createProduct.mutateAsync(
        buildCreateProductPayload(data, rowEdits, imageUrls),
      );
      onClose();
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
  });

  const attributesError = form.formState.errors.attributes;
  const listError =
    attributesError?.message ?? attributesError?.root?.message ?? undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة منتج يدوياً"
      showFooter={false}
      maxWidth="md:max-w-3xl"
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

        <Controller
          control={form.control}
          name="images"
          render={({ field, fieldState }) => (
            <MultiImageUploadField
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              title="صور المنتج"
              description="قم برفع صور المنتج (اختياري، يمكنك اختيار أكثر من صورة)"
            />
          )}
        />

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between pt-3">
            <label className="text-[18px]">المتغيرات</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={fields.length >= PRODUCT_CREATE_LIMITS.attributes}
              onClick={() => append({ name: '', options: [] })}
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
                <AttributeEditor
                  key={field.id}
                  index={index}
                  control={form.control}
                  setValue={form.setValue}
                  register={form.register}
                  labelError={attributesError?.[index]?.name?.message}
                  valuesError={attributesError?.[index]?.options?.message}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          )}
          {listError && <p className="text-red-500 text-sm">{listError}</p>}
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="pt-3">
            <label className="text-[18px]">تفاصيل المتغيرات</label>
            <p className="text-sm text-gray-500 mt-1">
              صف لكل مجموعة من القيم، السعر يبدأ بسعر المنتج ويمكن تعديله
            </p>
          </div>
          <VariantRows
            control={form.control}
            edits={rowEdits}
            onEdit={(key, edit) =>
              setRowEdits((current) => ({ ...current, [key]: edit }))
            }
          />
        </div>

        <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={isSaving}
          >
            {isSaving ? 'جارٍ الحفظ...' : 'حفظ المنتج'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddProductModal;

