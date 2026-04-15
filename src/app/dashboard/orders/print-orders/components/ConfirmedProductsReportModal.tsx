'use client';

import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { LiaFileExcelSolid, LiaFilePdfSolid } from 'react-icons/lia';
import { exportTableToPDF } from '@/utils/exportTableToPDF';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  usePackagingInventoryQuery,
  usePackagingInventoryCheckMutation,
} from '@/app/dashboard/services/dashboardReports';
import type { PackagingInventoryItem } from '@/app/dashboard/types';

interface ConfirmedProductsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
}

function getItemKey(item: PackagingInventoryItem): string {
  return `${item.productId}-${item.variants.map((v) => v.value).join('-')}`;
}

function exportToExcel(rows: PackagingInventoryItem[], warehouseName: string) {
  if (rows.length === 0) {
    toast.error('لا توجد بيانات لتصديرها');
    return;
  }

  const excelData = rows.map((row) => ({
    'المخزن': warehouseName,
    'الكمية': row.totalCount,
    'المتغير': row.variants.map((v) => v.value).join(' - ') || '-',
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

function handleExportToPDF(rows: PackagingInventoryItem[], warehouseName: string) {
  exportTableToPDF({
    title: `تقرير منتجات الطلبات المؤكدة - ${warehouseName}`,
    headers: ['المخزن', 'الكمية', 'المتغير', 'المنتج'],
    rows: rows.map((row) => [
      warehouseName,
      String(row.totalCount),
      row.variants.map((v) => v.value).join(' - ') || '-',
      row.productName,
    ]),
    fileName: `تقرير_المنتجات_المؤكدة_${warehouseName}`,
  });
}

function WarehouseTab({
  rows,
  isLoading,
  warehouseName,
  loadingKeys,
  onCheck,
}: {
  rows: PackagingInventoryItem[];
  isLoading: boolean;
  warehouseName: string;
  loadingKeys: Set<string>;
  onCheck: (item: PackagingInventoryItem) => void;
}) {
  const columns: DataTableColumn<PackagingInventoryItem>[] = [
    {
      key: 'checkedCount',
      header: 'اختيار',
      className: 'text-center w-16',
      headerClassName: '[&>div]:justify-center',
      render: (_value, row) => {
        const item = row as unknown as PackagingInventoryItem;
        const key = getItemKey(item);
        const isItemLoading = loadingKeys.has(key);
        return (
          <div className="flex justify-center">
            {isItemLoading ? (
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Checkbox
                checked={item.checkedCount > 0}
                onCheckedChange={() => onCheck(item)}
              />
            )}
          </div>
        );
      },
    },
    {
      key: 'productName',
      header: 'المنتج',
      className: 'text-center',
      headerClassName: '[&>div]:justify-center',
      render: (_value, row) => {
        const item = row as unknown as PackagingInventoryItem;
        return <span className="font-medium">{item.productName}</span>;
      },
    },
    {
      key: 'variants',
      header: 'المتغير',
      className: 'text-center',
      headerClassName: '[&>div]:justify-center',
      render: (_value, row) => {
        const item = row as unknown as PackagingInventoryItem;
        return item.variants.map((v) => v.value).join(' - ') || '-';
      },
    },
    {
      key: 'totalCount',
      header: 'الكمية',
      className: 'text-center',
      headerClassName: '[&>div]:justify-center',
    },
    {
      key: 'productId',
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
        <DataTable columns={columns} data={rows} isLoading={isLoading} keyField="productId" />
      )}
    </div>
  );
}

export function ConfirmedProductsReportModal({
  isOpen,
  onClose,
  status,
}: ConfirmedProductsReportModalProps) {
  const { data, isLoading } = usePackagingInventoryQuery(status, isOpen);
  const checkMutation = usePackagingInventoryCheckMutation();
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  const items = data?.items ?? [];

  const handleCheck = useCallback(
    async (item: PackagingInventoryItem) => {
      const key = getItemKey(item);

      setLoadingKeys((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });

      try {
        await checkMutation.mutateAsync(item.productId);
      } catch (err: any) {
        const msg = err?.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل تحديث العنصر');
      } finally {
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [checkMutation],
  );

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
            rows={items}
            isLoading={isLoading}
            warehouseName="المخزن الرئيسي"
            loadingKeys={loadingKeys}
            onCheck={handleCheck}
          />
        </TabsContent>

        <TabsContent value="sub">
          <WarehouseTab
            rows={items}
            isLoading={isLoading}
            warehouseName="المخزن الفرعي"
            loadingKeys={loadingKeys}
            onCheck={handleCheck}
          />
        </TabsContent>
      </Tabs>
    </BaseModal>
  );
}
