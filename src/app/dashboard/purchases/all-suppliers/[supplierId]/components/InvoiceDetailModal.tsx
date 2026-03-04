'use client';

import { useMemo } from 'react';
import {
  LiaUserTieSolid,
  LiaClockSolid,
  LiaFileExcelSolid,
  LiaFilePdfSolid,
} from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { getTimeAgo } from '@/utils/timeAgo';
import { SupplierInvoice } from '../types';
import { formatDate, exportInvoiceToExcel, exportInvoiceToPDF } from '../utils';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SupplierInvoice;
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
}: InvoiceDetailModalProps) {
  const totalQuantity = useMemo(
    () => invoice.items.reduce((sum, item) => sum + item.quantity, 0),
    [invoice.items],
  );

  const grandTotal = useMemo(
    () => invoice.items.reduce((sum, item) => sum + item.total, 0),
    [invoice.items],
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`فاتورة رقم ${invoice.invoiceNumber}`}
      showFooter={false}
      maxWidth="md:max-w-[700px]"
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <LiaUserTieSolid className="w-5 h-5 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">موظف المشتريات</span>
              <span className="text-sm font-bold text-gray-800">
                {invoice.createdByName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <LiaClockSolid className="w-5 h-5 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">تاريخ الانشاء</span>
              <span className="text-sm font-bold text-gray-800">
                {getTimeAgo(invoice.createdAt)}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(invoice.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-800 mb-3">
            الاصناف المشتريات
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-2 font-semibold text-gray-500">
                    صورة المنتج
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-500">
                    اسم الصنف
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-500">
                    الكمية
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-500">
                    السعر
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-500">
                    الاجمالي
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="py-3 px-2">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-800 font-medium">
                      {item.productName}
                    </td>
                    <td className="py-3 px-2 text-center text-gray-800">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-center text-gray-800">
                      {item.price.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-left text-gray-800 font-medium">
                      {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between bg-secondary p-3 rounded-lg">
            <span className="text-base font-bold text-gray-800">
              إجمالي عدد القطع
            </span>
            <span className="text-base font-bold text-gray-800">
              {totalQuantity} قطعة
            </span>
          </div>
          <div className="flex items-center justify-between bg-secondary p-3 rounded-lg">
            <span className="text-base font-bold text-gray-800">
              المبلغ الاجمالي
            </span>
            <span className="text-base font-bold text-gray-800">
              {grandTotal.toFixed(2)} جنيه
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="default"
            className="rounded-xl font-semibold text-sm px-6 flex items-center gap-2"
            onClick={() => exportInvoiceToPDF(invoice)}
          >
            <LiaFilePdfSolid className="w-4 h-4" />
            تصدير PDF
          </Button>
          <Button
            variant="outline"
            className="rounded-xl font-semibold text-sm px-6 flex items-center gap-2"
            onClick={() => exportInvoiceToExcel(invoice)}
          >
            <LiaFileExcelSolid className="w-4 h-4" />
            تصدير Excel
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
