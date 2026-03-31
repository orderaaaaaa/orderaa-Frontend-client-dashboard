'use client';

import { useMemo, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { LiaFileExcelSolid, LiaFilePdfSolid } from 'react-icons/lia';
import { exportTableToPDF } from '@/utils/exportTableToPDF';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { useConfirmedProductsReportQuery } from '@/app/dashboard/services/dashboardReports';
import { transformEditRejectedProducts } from '@/app/dashboard/utils/transformers';
import type { PostponedOrderContentItem } from '@/app/dashboard/types';

interface ConfirmedProductsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function exportToExcel(rows: PostponedOrderContentItem[]) {
  if (rows.length === 0) {
    toast.error('لا توجد بيانات لتصديرها');
    return;
  }

  const excelData = rows.map((row) => ({
    'المخزن الرئيسي': 'مخزن أ',
    'الكمية': row.quantity,
    'المتغير': [row.variant1, row.variant2].filter(Boolean).join(' - '),
    'المنتج': row.productName,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 10 },
    { wch: 20 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المنتجات المؤكدة');

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `تقرير_المنتجات_المؤكدة_${timestamp}.xlsx`);
  toast.success('تم تصدير التقرير بنجاح');
}

function handleExportToPDF(rows: PostponedOrderContentItem[]) {
  exportTableToPDF({
    title: 'تقرير منتجات الطلبات المؤكدة',
    headers: ['المخزن الرئيسي', 'الكمية', 'المتغير', 'المنتج'],
    rows: rows.map((row) => [
      'مخزن أ',
      String(row.quantity),
      [row.variant1, row.variant2].filter(Boolean).join(' - ') || '-',
      row.productName,
    ]),
    fileName: 'تقرير_المنتجات_المؤكدة',
  });
}

export function ConfirmedProductsReportModal({
  isOpen,
  onClose,
}: ConfirmedProductsReportModalProps) {
  const { data, isLoading } = useConfirmedProductsReportQuery(isOpen);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

  const rows = useMemo(() => {
    if (!data) return [];
    return transformEditRejectedProducts(data);
  }, [data]);

  const toggleChecked = useCallback((id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const columns: DataTableColumn<PostponedOrderContentItem>[] = [
    {
      key: 'productName',
      header: 'المخزن الرئيسي',
      className: 'text-center',
      headerClassName: '[&>div]:justify-center',
      render: () => 'مخزن أ',
    },
    {
      key: 'quantity',
      header: 'الكمية',
      className: 'text-center',
      headerClassName: '[&>div]:justify-center',
    },
    {
      key: 'variant1',
      header: 'المتغير',
      className: 'text-center',
      headerClassName: '[&>div]:justify-center',
      render: (_value, row) => {
        const item = row as unknown as PostponedOrderContentItem;
        return [item.variant1, item.variant2].filter(Boolean).join(' - ') || '-';
      },
    },
    {
      key: 'id',
      header: 'المنتج',
      className: 'text-center',
      headerClassName: '[&>div]:justify-center',
      render: (_value, row) => {
        const item = row as unknown as PostponedOrderContentItem;
        return <span className="font-medium">{item.productName}</span>;
      },
    },
    {
      key: 'percentage',
      header: 'اختيار',
      className: 'text-center w-16',
      headerClassName: '[&>div]:justify-center',
      render: (_value, row) => {
        const item = row as unknown as PostponedOrderContentItem;
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={checkedIds.has(item.id)}
              onCheckedChange={() => toggleChecked(item.id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تقرير منتجات الطلبات المؤكدة"
      showFooter={false}
      maxWidth="md:max-w-4xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(rows)}
            disabled={rows.length === 0}
            className="gap-1.5"
          >
            <LiaFileExcelSolid className="w-4 h-4 text-green-600" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportToPDF(rows)}
            disabled={rows.length === 0}
            className="gap-1.5"
          >
            <LiaFilePdfSolid className="w-4 h-4 text-red-600" />
            PDF
          </Button>
        </div>

        {!isLoading && rows.length === 0 ? (
          <p className="py-12 text-center text-gray-500">لا توجد بيانات</p>
        ) : (
          <DataTable columns={columns} data={rows} isLoading={isLoading} />
        )}
      </div>
    </BaseModal>
  );
}
