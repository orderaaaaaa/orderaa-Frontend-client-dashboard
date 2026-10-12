'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { LiaPlusSolid } from 'react-icons/lia';
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
  Control,
  UseFormSetValue,
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
import { AttributeChipsEditor } from '../AttributeChipsEditor';
import { CompactField } from '../CompactField';
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
  editVariantRowPrice,
  variantRowPricePlaceholder,
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
  labelError?: string;
  valuesError?: string;
  onRemove: () => void;
  disabled: boolean;
}

function AttributeEditor({
  index,
  control,
  setValue,
  labelError,
  valuesError,
  onRemove,
  disabled,
}: AttributeEditorProps) {
  const name = useWatch({ control, name: `attributes.${index}.name` }) as
    | string
    | undefined;
  const values = useWatch({
    control,
    name: `attributes.${index}.options`,
  }) as string[] | undefined;
  const currentValues = values ?? [];
  const setOptions = (next: string[]) =>
    setValue(`attributes.${index}.options`, next, {
      shouldDirty: true,
      shouldValidate: true,
    });

  return (
    <AttributeChipsEditor
      name={name ?? ''}
      onNameChange={(next) =>
        setValue(`attributes.${index}.name`, next, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
      values={currentValues}
      onAddValue={(value) => setOptions([...currentValues, value])}
      onRemoveValue={(valueIndex) =>
        setOptions(currentValues.filter((_, i) => i !== valueIndex))
      }
      onRemove={onRemove}
      maxValues={PRODUCT_CREATE_LIMITS.optionsPerAttribute}
      nameError={labelError}
      valuesError={valuesError}
      disabled={disabled}
    />
  );
}

interface VariantRowsProps {
  control: Control<AddProductFormData>;
  edits: Record<string, VariantRowEdit>;
  onEdit: (key: string, edit: VariantRowEdit) => void;
  disabled: boolean;
}

function VariantRows({ control, edits, onEdit, disabled }: VariantRowsProps) {
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
            className="grid grid-cols-2 sm:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] gap-2 sm:items-end rounded-lg border border-gray-200 bg-white p-3"
          >
            <span className="col-span-2 sm:col-span-1 text-sm font-semibold text-gray-800 min-w-0 break-words sm:self-center">
              {label}
            </span>
            <CompactField
              label="SKU"
              value={edit.sku ?? ''}
              disabled={disabled}
              onChange={(e) => onEdit(key, { ...edit, sku: e.target.value })}
            />
            <CompactField
              label="الباركود"
              value={edit.barcode ?? ''}
              disabled={disabled}
              onChange={(e) => onEdit(key, { ...edit, barcode: e.target.value })}
            />
            <CompactField
              label="السعر"
              type="number"
              inputMode="decimal"
              min={0}
              className="col-span-2 sm:col-span-1"
              placeholder={variantRowPricePlaceholder(productPrice, 'السعر')}
              value={edit.price ?? ''}
              disabled={disabled}
              onChange={(e) =>
                onEdit(key, editVariantRowPrice(edit, e.target.value))
              }
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
      isLoading={isSaving}
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
              disabled={
                isSaving || fields.length >= PRODUCT_CREATE_LIMITS.attributes
              }
              onClick={() => append({ name: '', options: [] })}
              className="min-h-10 text-primary font-semibold hover:bg-primary hover:text-white"
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
                  disabled={isSaving}
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
            disabled={isSaving}
            edits={rowEdits}
            onEdit={(key, edit) =>
              setRowEdits((current) => ({ ...current, [key]: edit }))
            }
          />
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-8 -mb-6 mt-2 flex justify-end gap-3 border-t border-gray-100 bg-white px-4 sm:px-8 py-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={onClose}
            disabled={isSaving}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            className="min-h-10 bg-primary hover:bg-primary/90"
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

