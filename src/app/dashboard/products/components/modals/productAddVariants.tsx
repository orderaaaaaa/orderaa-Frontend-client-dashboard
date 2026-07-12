'use client';

import React, { useEffect } from 'react';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/base-modal';
import { useUpdateProductVariants } from '../../hooks/useProduct';

interface VariantItem {
  attribute: string;
  option: string;
}

interface ProductAddVariantsModalProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
  variants?: VariantItem[];
}

const variantSchema = z.object({
  rows: z
    .array(
      z.object({
        attribute: z.string(),
        option: z.string(),
      })
    )
    .refine((rows) => rows.some((r) => r.attribute.trim() && r.option.trim()), {
      message: 'يجب إضافة خاصية واحدة على الأقل',
    }),
});

type VariantFormData = z.infer<typeof variantSchema>;

const ProductAddVariantsModal: React.FC<ProductAddVariantsModalProps> = ({
  productId,
  isOpen,
  onClose,
  variants,
}) => {
  const { mutate, isPending } = useUpdateProductVariants(productId);

  const form = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: { rows: [{ attribute: '', option: '' }] },
    mode: 'onChange',
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'rows',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (variants && variants.length > 0) {
      replace(variants);
    } else {
      replace([{ attribute: '', option: '' }]);
    }
  }, [isOpen]);

  const handleRemoveRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      replace([{ attribute: '', option: '' }]);
    }
  };

  const handleClose = () => {
    if (!isPending) {
      form.reset({ rows: [{ attribute: '', option: '' }] });
      onClose();
    }
  };

  const onSubmit = form.handleSubmit((data) => {
    const filtered = data.rows
      .filter((r) => r.attribute.trim() && r.option.trim())
      .map((r) => ({ attribute: r.attribute.trim(), option: r.option.trim() }));

    if (!filtered.length) return;

    mutate(
      { variants: filtered },
      { onSuccess: () => handleClose() }
    );
  });

  const rows = form.watch('rows') ?? [];
  const hasValidRow = rows.some((r) => r.attribute?.trim() && r.option?.trim());

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="إضافة خصائص المنتج"
      showFooter={false}
      isLoading={isPending}
      maxWidth="md:max-w-xl"
    >
      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start">
              <div className="grid grid-cols-2 gap-3 flex-1">
                <Input
                  register={form.register}
                  name={`rows.${index}.attribute`}
                  placeholder="الخاصية (مثلاً: الخامة)"
                  disabled={isPending}
                />
                <Input
                  register={form.register}
                  name={`rows.${index}.option`}
                  placeholder="القيمة (مثلاً: قماش)"
                  disabled={isPending}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRow(index)}
                disabled={isPending}
                className="text-red-500 hover:bg-red-50 mt-1"
              >
                <LiaTimesSolid className="w-5 h-5" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            onClick={() => append({ attribute: '', option: '' })}
            disabled={isPending}
            className="text-primary font-semibold hover:bg-primary hover:text-white"
          >
            <LiaPlusSolid className="w-5 h-5" />
            إضافة خاصية جديدة
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isPending || !hasValidRow}
            className="bg-primary hover:bg-primary/90"
          >
            {isPending ? 'جاري الحفظ...' : 'حفظ الخصائص'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ProductAddVariantsModal;
