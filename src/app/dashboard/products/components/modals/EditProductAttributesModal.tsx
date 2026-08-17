'use client';

import React, { useEffect, useState } from 'react';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/base-modal';
import { useUpdateProductAttributes } from '../../hooks/useProduct';
import { AttributeManual, AttributeOptionManual } from '../../types/products';

interface EditProductAttributesModalProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
  attributes?: AttributeManual[];
}

const emptyOption = (): AttributeOptionManual => ({ name: '' });
const emptyAttribute = (): AttributeManual => ({ name: '', options: [emptyOption()] });

const EditProductAttributesModal: React.FC<EditProductAttributesModalProps> = ({
  productId,
  isOpen,
  onClose,
  attributes,
}) => {
  const { mutate, isPending } = useUpdateProductAttributes(productId);
  const [attrs, setAttrs] = useState<AttributeManual[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (attributes && attributes.length > 0) {
      // Deep clone so edits don't mutate the incoming prop
      setAttrs(
        attributes.map((a) => ({
          id: a.id,
          name: a.name,
          options: a.options.map((o) => ({ id: o.id, name: o.name })),
        })),
      );
    } else {
      setAttrs([emptyAttribute()]);
    }
  }, [isOpen]);

  const updateAttrName = (attrIdx: number, name: string) => {
    setAttrs((prev) =>
      prev.map((a, i) => (i === attrIdx ? { ...a, name } : a)),
    );
  };

  const updateOptionName = (
    attrIdx: number,
    optIdx: number,
    name: string,
  ) => {
    setAttrs((prev) =>
      prev.map((a, i) =>
        i === attrIdx
          ? {
              ...a,
              options: a.options.map((o, j) =>
                j === optIdx ? { ...o, name } : o,
              ),
            }
          : a,
      ),
    );
  };

  const addOption = (attrIdx: number) => {
    setAttrs((prev) =>
      prev.map((a, i) =>
        i === attrIdx ? { ...a, options: [...a.options, emptyOption()] } : a,
      ),
    );
  };

  const removeOption = (attrIdx: number, optIdx: number) => {
    setAttrs((prev) =>
      prev.map((a, i) => {
        if (i !== attrIdx) return a;
        if (a.options.length <= 1) {
          return { ...a, options: [emptyOption()] };
        }
        return { ...a, options: a.options.filter((_, j) => j !== optIdx) };
      }),
    );
  };

  const addAttribute = () => {
    setAttrs((prev) => [...prev, emptyAttribute()]);
  };

  const removeAttribute = (attrIdx: number) => {
    setAttrs((prev) => {
      if (prev.length <= 1) return [emptyAttribute()];
      return prev.filter((_, i) => i !== attrIdx);
    });
  };

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const handleSubmit = () => {
    const cleaned: AttributeManual[] = attrs
      .map((a) => ({
        ...(a.id !== undefined ? { id: a.id } : {}),
        name: a.name.trim(),
        options: a.options
          .filter((o) => o.name.trim())
          .map((o) => ({
            ...(o.id !== undefined ? { id: o.id } : {}),
            name: o.name.trim(),
          })),
      }))
      .filter((a) => a.name && a.options.length > 0);

    if (!cleaned.length) return;

    mutate(
      { attributes: cleaned },
      { onSuccess: () => handleClose() },
    );
  };

  const hasValid = attrs.some(
    (a) => a.name.trim() && a.options.some((o) => o.name.trim()),
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="تعديل متغيرات المنتج"
      showFooter={false}
      isLoading={isPending}
      maxWidth="md:max-w-2xl"
    >
      <div className="space-y-5">
        {attrs.map((attr, attrIdx) => (
          <div
            key={attrIdx}
            className="rounded-lg border border-gray-200 p-4 bg-gray-50/50"
          >
            <div className="flex gap-3 items-start mb-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  المتغير
                </label>
                <Input
                  value={attr.name}
                  onChange={(e) => updateAttrName(attrIdx, e.target.value)}
                  placeholder="المتغير (مثلاً: اللون)"
                  disabled={isPending}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAttribute(attrIdx)}
                disabled={isPending}
                className="text-red-500 hover:bg-red-50 mt-6"
              >
                <LiaTimesSolid className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-2 pr-1">
              <label className="block text-xs text-gray-500 mb-1">
                الخيارات
              </label>
              {attr.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex gap-2 items-center">
                  <Input
                    value={opt.name}
                    onChange={(e) =>
                      updateOptionName(attrIdx, optIdx, e.target.value)
                    }
                    placeholder="القيمة (مثلاً: أسود)"
                    disabled={isPending}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(attrIdx, optIdx)}
                    disabled={isPending}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <LiaTimesSolid className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => addOption(attrIdx)}
                disabled={isPending}
                className="text-primary font-semibold hover:bg-primary hover:text-white text-sm"
              >
                <LiaPlusSolid className="w-4 h-4" />
                إضافة خيار
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addAttribute}
          disabled={isPending}
          className="w-full border-dashed text-primary hover:bg-primary hover:text-white"
        >
          <LiaPlusSolid className="w-5 h-5" />
          إضافة خاصية جديدة
        </Button>

        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !hasValid}
            className="bg-primary hover:bg-primary/90"
          >
            {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default EditProductAttributesModal;
