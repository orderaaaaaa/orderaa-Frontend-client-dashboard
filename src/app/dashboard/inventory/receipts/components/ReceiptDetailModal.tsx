'use client';

import { memo } from 'react';
import Image from 'next/image';
import { LiaFileInvoiceSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { getTimeAgo } from '@/utils/timeAgo';
import { Receipt } from '../types';
import { formatDate } from '../utils';

interface ReceiptDetailModalProps {
  receipt: Receipt | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailField {
  label: string;
  value?: string;
  subtitle?: string;
}

const ReceiptDetailModal = memo(
  ({ receipt, isOpen, onClose }: ReceiptDetailModalProps) => {
    if (!receipt) return null;

    const fieldRows: DetailField[][] = [
      [
        { label: `رقم الفاتورة ${receipt.invoiceNumber}`, subtitle: receipt.companyName },
        { label: 'نوع المعاملة', value: receipt.transactionType },
      ],
      [
        { label: 'التاريخ و الوقت', value: getTimeAgo(receipt.createdAt), subtitle: formatDate(receipt.createdAt) },
        { label: 'عدد القطع', value: `${receipt.itemsCount}` },
      ],
    ];

    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="تفاصيل الاستلام"
        showFooter={false}
      >
        <div className="flex flex-col">
          <div className="py-4 flex flex-col justify-between items-start gap-1">
            <h1 className="flex flex-row items-center gap-1 text-sm sm:text-base font-bold text-black">
              <LiaFileInvoiceSolid className="text-primary shrink-0" style={{ width: 20, height: 20 }} />
              تفاصيل الاستلام
            </h1>
            <p className="ps-6 text-sm sm:text-base text-black/90">تفاصيل الفاتورة المرتبطة بالاستلام</p>
          </div>

          {fieldRows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-2 gap-x-4 border-t border-gray-200 py-4">
              {row.map((field) => (
                <div key={field.label} className="flex flex-col items-start gap-1">
                  <span className="text-sm font-bold text-black">{field.label}</span>
                  {field.value && (
                    <span className="text-base font-semibold text-gray-400">{field.value}</span>
                  )}
                  {field.subtitle && (
                    <span className="text-sm text-gray-400">{field.subtitle}</span>
                  )}
                </div>
              ))}
            </div>
          ))}

          {receipt.imageUrl && (
            <div className="flex flex-col items-start gap-3 border-t border-gray-200 pt-4">
              <span className="text-base font-bold text-black">
                صورة الفاتورة
              </span>
              <div className="w-full rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={receipt.imageUrl}
                  alt="صورة الفاتورة"
                  width={600}
                  height={800}
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </BaseModal>
    );
  }
);

ReceiptDetailModal.displayName = 'ReceiptDetailModal';

export default ReceiptDetailModal;
