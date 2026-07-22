'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import {
  LiaUserTieSolid,
  LiaClockSolid,
  LiaFileExcelSolid,
  LiaFilePdfSolid,
  LiaImageSolid,
} from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';
import { Button } from '@/components/ui/button';
import { getTimeAgo } from '@/utils/timeAgo';
import { SupplierInvoice, SupplierInvoiceItem } from '../types';
import { formatDate, exportInvoiceToExcel, exportInvoiceToPDF } from '../utils';

function buildProductColumns(
  products: SupplierInvoiceItem[],
): DataTableColumn<SupplierInvoiceItem & Record<string, unknown>>[] {
  const hasPackageColumns = products.some(
    (p) => p.packageCount != null || p.piecesPerPackage != null,
  );

  const cols: DataTableColumn<SupplierInvoiceItem & Record<string, unknown>>[] = [
    { key: 'product', header: 'اسم الصنف', render: (_value, row) => row.product.name },
    { key: 'quantity', header: 'إجمالي عدد القطع' },
    ...(hasPackageColumns
      ? [
          {
            key: 'packageCount',
            header: 'عدد الطرود',
            render: (value: unknown) => (value != null ? String(value) : null),
          } as DataTableColumn<SupplierInvoiceItem & Record<string, unknown>>,
          {
            key: 'piecesPerPackage',
            header: 'عدد القطع في الطرد',
            render: (value: unknown) => (value != null ? String(value) : null),
          } as DataTableColumn<SupplierInvoiceItem & Record<string, unknown>>,
        ]
      : []),
    { key: 'price', header: 'السعر', render: (value, row) => (value as number).toLocaleString() + ' جنيه' },
    {
      key: 'total',
      header: 'الاجمالي',
      render: (_value, row) => (row.quantity * row.price).toLocaleString(),
    },
  ];
  return cols;
}

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
  const columns = useMemo(
    () => buildProductColumns(invoice.products),
    [invoice.products],
  );

  const totalQuantity = useMemo(
    () => invoice.products.reduce((sum, item) => sum + item.quantity, 0),
    [invoice.products],
  );

  const grandTotal = useMemo(
    () => invoice.products.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [invoice.products],
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`فاتورة رقم ${invoice.code}`}
      showFooter={false}
      maxWidth="md:max-w-[700px]"
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <LiaUserTieSolid className="w-5 h-5 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-900">موظف المشتريات</span>
              <span className="text-sm font-bold text-gray-800">
                {invoice.createdByEmployee ? getDepartmentLabel(invoice.createdByEmployee.department) : 'غير محدد'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <LiaClockSolid className="w-5 h-5 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-900">تاريخ الانشاء</span>
              <span className="text-sm font-bold text-gray-800">
                {getTimeAgo(invoice.createdAt)}
              </span>
              <span className="text-xs text-gray-900">
                {formatDate(invoice.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-800 mb-3">
            الاصناف المشتريات
          </h3>
          <DataTable
            columns={columns}
            data={invoice.products as (SupplierInvoiceItem & Record<string, unknown>)[]}
            keyField="id"
            emptyMessage="لا توجد اصناف"
          />
        </div>

        {invoice.images?.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <LiaImageSolid className="w-5 h-5 text-primary" />
              صورة الفاتورة
            </h3>
            <div className="flex flex-wrap gap-3">
              {invoice.images.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition-colors"
                >
                  <Image
                    src={url}
                    alt={`صورة الفاتورة ${idx + 1}`}
                    width={200}
                    height={200}
                    className="object-cover w-[200px] h-[200px]"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

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
