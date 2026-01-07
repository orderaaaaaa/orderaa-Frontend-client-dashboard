import React, { useState } from 'react';
import { IoMdClose, IoMdTrash } from 'react-icons/io';
import { LiaPlusSolid } from 'react-icons/lia';
import { useUpdateProductVariants } from '../../hooks/useProduct';

interface VariantRow {
  key: string;
  value: string;
}

interface ProductAddVariantsModalProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ProductAddVariantsModal: React.FC<ProductAddVariantsModalProps> = ({
  productId,
  isOpen,
  onClose,
}) => {
  const [rows, setRows] = useState<VariantRow[]>([{ key: '', value: '' }]);
  const { mutate, isPending } = useUpdateProductVariants(productId);

  if (!isOpen) return null;

  const addRow = () => {
    setRows((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((_, i) => i !== index));
    } else {
      setRows([{ key: '', value: '' }]);
    }
  };

  const updateRow = (index: number, field: keyof VariantRow, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = () => {
    const variants = rows
      .filter((r) => r.key.trim() && r.value.trim())
      .map((r) => ({ [r.key.trim()]: r.value.trim() }));

    if (!variants.length) return;

    mutate(
      { variants },
      {
        onSuccess: () => {
          onClose();
          setRows([{ key: '', value: '' }]);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-xl text-gray-800">
            إضافة خصائص المنتج
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <IoMdClose size={24} className="text-gray-500 " />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div
                key={index}
                className="group flex gap-3 items-center animate-in slide-in-from-top-2 duration-150"
              >
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <input
                    placeholder="الخاصية (مثلاً: الخامة )"
                    value={row.key}
                    onChange={(e) => updateRow(index, 'key', e.target.value)}
                    className="rounded-lg px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <input
                    placeholder="القيمة (مثلاً: قماش)"
                    value={row.value}
                    onChange={(e) => updateRow(index, 'value', e.target.value)}
                    className="rounded-lg px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={() => removeRow(index)}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="حذف الصف"
                >
                  <IoMdClose size={22} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addRow}
            className="mt-4 flex items-center gap-2 text-primary font-semibold hover:bg-primary hover:text-white cursor-pointer px-4 py-2 rounded-lg transition-colors"
          >
            <LiaPlusSolid className="w-5 h-5" />
            <span>إضافة خاصية جديدة</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !rows.some((r) => r.key && r.value)}
            className="px-8 py-2.5 font-bold bg-primary hover:bg-primary/90 rounded-lg cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all"
          >
            {isPending ? 'جاري الحفظ...' : 'حفظ الخصائص'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductAddVariantsModal;
