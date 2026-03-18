'use client';

import { memo } from 'react';
import Image from 'next/image';
import { LiaFileInvoiceSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { getTimeAgo } from '@/utils/timeAgo';
import { Invoice } from '../types';
import { formatDate } from '../utils';
import { INVOICE_TYPE_LABEL } from '../../constants';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailField {
  label: string;
  value?: string;
  subtitle?: string;
}

const InvoiceDetailModal = memo(
  ({ invoice, isOpen, onClose }: InvoiceDetailModalProps) => {
    if (!invoice) return null;

    const firstFile = invoice.files[0];
    const imageUrl = firstFile ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${firstFile.fileId}` : null;

    const fieldRows: DetailField[][] = [
      [
        { label: `رقم الفاتورة ${invoice.code}`, subtitle: invoice.supplier.name },
        { label: 'نوع المعاملة', value: INVOICE_TYPE_LABEL[invoice.type] ?? invoice.type },
      ],
      [
        { label: 'التاريخ و الوقت', value: getTimeAgo(invoice.createdAt), subtitle: formatDate(invoice.createdAt) },
        { label: 'المبلغ', value: invoice.totalAmount.toLocaleString() },
      ],
    ];

    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="تفاصيل الفاتورة"
        showFooter={false}
      >
        <div className="flex flex-col">
          <div className="py-4 flex flex-col justify-between items-start gap-1">
            <h1 className="flex flex-row items-center gap-1 text-sm sm:text-base font-bold text-black">
              <LiaFileInvoiceSolid className="text-primary shrink-0" style={{ width: 20, height: 20 }} />
              تفاصيل الفاتورة
            </h1>
            <p className="ps-6 text-sm sm:text-base text-black/90">تفاصيل الفاتورة المرتبطة بالمعاملة</p>
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

          {imageUrl && (
            <div className="flex flex-col items-start gap-3 border-t border-gray-200 pt-4">
              <span className="text-base font-bold text-black">
                صورة الفاتورة
              </span>
              <div className="w-full rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={imageUrl}
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

InvoiceDetailModal.displayName = 'InvoiceDetailModal';

export default InvoiceDetailModal;
