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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmedProductsReportQuery } from '@/app/dashboard/services/dashboardReports';
import { transformEditRejectedProducts } from '@/app/dashboard/utils/transformers';
import type { PostponedOrderContentItem } from '@/app/dashboard/types';

interface ConfirmedProductsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function exportToExcel(rows: PostponedOrderContentItem[], warehouseName: string) {
  if (rows.length === 0) {
    toast.error('لا توجد بيانات لتصديرها');
    return;
  }

  const excelData = rows.map((row) => ({
    'المخزن': warehouseName,
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
  XLSX.writeFile(workbook, `تقرير_المنتجات_المؤكدة_${warehouseName}_${timestamp}.xlsx`);
  toast.success('تم تصدير التقرير بنجاح');
}

function handleExportToPDF(rows: PostponedOrderContentItem[], warehouseName: string) {
  exportTableToPDF({
    title: `تقرير منتجات الطلبات المؤكدة - ${warehouseName}`,
    headers: ['المخزن', 'الكمية', 'المتغير', 'المنتج'],
    rows: rows.map((row) => [
      warehouseName,
      String(row.quantity),
      [row.variant1, row.variant2].filter(Boolean).join(' - ') || '-',
      row.productName,
    ]),
    fileName: `تقرير_المنتجات_المؤكدة_${warehouseName}`,
  });
}

function WarehouseTab({
  rows,
  isLoading,
  warehouseName,
  checkedIds,
  toggleChecked,
}: {
  rows: PostponedOrderContentItem[];
  isLoading: boolean;
  warehouseName: string;
  checkedIds: Set<number>;
  toggleChecked: (id: number) => void;
}) {
  const columns: DataTableColumn<PostponedOrderContentItem>[] = [
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
      key: 'quantity',
      header: 'الكمية',
      className: 'text-center',
      headerClassName: '[&>div]:justify-center',
    },
    {
      key: 'productName',
      header: 'المخزن',
      className: 'text-center',
      headerClassName: '[&>div]:justify-center',
      render: () => warehouseName,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToExcel(rows, warehouseName)}
          disabled={rows.length === 0}
          className="gap-1.5"
        >
          <LiaFileExcelSolid className="w-4 h-4 text-green-600" />
          Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExportToPDF(rows, warehouseName)}
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
  );
}

export function ConfirmedProductsReportModal({
  isOpen,
  onClose,
}: ConfirmedProductsReportModalProps) {
  const { data, isLoading } = useConfirmedProductsReportQuery(isOpen);
  const [mainCheckedIds, setMainCheckedIds] = useState<Set<number>>(new Set());
  const [subCheckedIds, setSubCheckedIds] = useState<Set<number>>(new Set());

  const rows = useMemo(() => {
    if (!data) return [];
    return transformEditRejectedProducts(data);
  }, [data]);

  const mainRows = useMemo(() => {
    const half = Math.ceil(rows.length / 2);
    return rows.slice(0, half);
  }, [rows]);

  const subRows = useMemo(() => {
    const half = Math.ceil(rows.length / 2);
    return rows.slice(half);
  }, [rows]);

  const toggleMainChecked = useCallback((id: number) => {
    setMainCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSubChecked = useCallback((id: number) => {
    setSubCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تقرير منتجات الطلبات المؤكدة"
      showFooter={false}
      maxWidth="md:max-w-4xl"
    >
      <Tabs defaultValue="main">
        <TabsList>
          <TabsTrigger value="sub">المخزن الفرعي</TabsTrigger>
          <TabsTrigger value="main">المخزن الرئيسي</TabsTrigger>
        </TabsList>

        <TabsContent value="main">
          <WarehouseTab
            rows={mainRows}
            isLoading={isLoading}
            warehouseName="المخزن الرئيسي"
            checkedIds={mainCheckedIds}
            toggleChecked={toggleMainChecked}
          />
        </TabsContent>

        <TabsContent value="sub">
          <WarehouseTab
            rows={subRows}
            isLoading={isLoading}
            warehouseName="المخزن الفرعي"
            checkedIds={subCheckedIds}
            toggleChecked={toggleSubChecked}
          />
        </TabsContent>
      </Tabs>
    </BaseModal>
  );
}
