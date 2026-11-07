'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import BaseModal from '@/components/ui/base-modal';
import type {
  ProductApiStoreLink,
  ProductDetailVariant,
} from '../../types/products';

interface DeleteVariantDialogProps {
  variant: ProductDetailVariant | null;
  storeLinked: boolean;
  storeLinks?: Pick<ProductApiStoreLink, 'storeName'>[];
  label: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteVariantDialog({
  variant,
  storeLinked,
  storeLinks = [],
  label,
  onCancel,
  onConfirm,
}: DeleteVariantDialogProps) {
  const storeNames = storeLinks.flatMap((link) =>
    link.storeName ? [link.storeName] : [],
  );
  return (
    <BaseModal
      isOpen={variant !== null}
      onClose={onCancel}
      title={storeLinked ? 'حذف متغير مرتبط بمتجرك' : 'حذف المتغير'}
      onConfirm={onConfirm}
      confirmText="حذف"
      confirmButtonClassName="w-[120px] h-10 sm:w-[146px] sm:h-[37px] bg-red-600 border-[1.5px] border-red-600 rounded-[28px] flex items-center justify-center gap-1.5 sm:gap-2 hover:brightness-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      maxWidth="md:max-w-lg"
    >
      <div className="space-y-3 text-sm text-gray-700">
        <p>
          سيتم حذف المتغير <span className="font-semibold">{label}</span>. يمكنك استعادته من قائمة
          المتغيرات المحذوفة.
        </p>
        {storeLinked && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <ul className="list-disc space-y-1 ps-4">
              <li>
                {storeNames.length > 0
                  ? `هذا المتغير مرتبط بمتجرك: ${storeNames.join('، ')}.`
                  : 'هذا المتغير مرتبط بمتجرك.'}
              </li>
              <li>أي طلب جديد من المتجر على هذا المتغير سيذهب إلى قائمة المفقودات حتى يُنقل الربط.</li>
              <li>بعد الحذف لن تعيده مزامنة المتجر.</li>
            </ul>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
