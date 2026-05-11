'use client';

import { useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { LiaFileExcelSolid, LiaFilePdfSolid, LiaCheckCircleSolid } from 'react-icons/lia';
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
  selectedKeys,
  onToggle,
  onToggleAll,
}: {
  rows: PackagingInventoryItem[];
  isLoading: boolean;
  warehouseName: string;
  selectedKeys: Set<string>;
  onToggle: (item: PackagingInventoryItem) => void;
  onToggleAll: (checked: boolean) => void;
}) {
  const allKeys = rows.map(getItemKey);
  const allChecked = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));
  const someChecked = allKeys.some((k) => selectedKeys.has(k));

  const columns: DataTableColumn<PackagingInventoryItem>[] = [
    {
      key: 'checkedCount',
      header: '',
      className: 'text-center w-16',
      headerClassName: '[&>div]:justify-center',
      render: (_value, row) => {
        const item = row as unknown as PackagingInventoryItem;
        const key = getItemKey(item);
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={selectedKeys.has(key)}
              onCheckedChange={() => onToggle(item)}
            />
          </div>
        );
      },
    },
    {
      key: 'productName',
      header: 'المنتج',
      className: 'text-center break-words whitespace-normal max-w-[200px]',
      headerClassName: '[&>div]:justify-center',
      render: (_value, row) => {
        const item = row as unknown as PackagingInventoryItem;
        return (
          <span className="font-medium break-words whitespace-normal leading-snug inline-block">
            {item.productName}
          </span>
        );
      },
    },
    {
      key: 'variants',
      header: 'المتغير',
      className: 'text-center break-words whitespace-normal max-w-[150px]',
      headerClassName: '[&>div]:justify-center',
      render: (_value, row) => {
        const item = row as unknown as PackagingInventoryItem;
        return (
          <span className="break-words whitespace-normal leading-snug inline-block">
            {item.variants.map((v) => v.value).join(' - ') || '-'}
          </span>
        );
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {rows.length > 0 ? (
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <Checkbox
              checked={allChecked ? true : someChecked ? 'indeterminate' : false}
              onCheckedChange={(checked) => onToggleAll(!!checked && checked !== 'indeterminate' ? true : !someChecked)}
            />
            <span>تحديد الكل ({rows.length})</span>
          </label>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
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
      </div>

      {!isLoading && rows.length === 0 ? (
        <p className="py-12 text-center text-gray-500">لا توجد بيانات</p>
      ) : (
        <DataTable
          columns={columns}
          data={rows.map((row) => ({ ...row, _rowKey: getItemKey(row) }))}
          isLoading={isLoading}
          keyField="_rowKey"
        />
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
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const items = data?.items ?? [];

  useEffect(() => {
    if (!isOpen) {
      setSelectedKeys(new Set());
    }
  }, [isOpen]);

  const handleToggle = useCallback((item: PackagingInventoryItem) => {
    const key = getItemKey(item);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(
    (checked: boolean) => {
      setSelectedKeys(() => {
        if (!checked) return new Set();
        return new Set(items.map(getItemKey));
      });
    },
    [items],
  );

  const handleConfirm = useCallback(async () => {
    if (selectedKeys.size === 0) return;
    const itemsByKey = new Map(items.map((item) => [getItemKey(item), item]));
    const selectedItems = Array.from(selectedKeys)
      .map((key) => itemsByKey.get(key))
      .filter((item): item is PackagingInventoryItem => !!item);

    try {
      await checkMutation.mutateAsync({
        status,
        items: selectedItems.map((item) => ({
          productId: item.productId,
          variants: item.variants,
        })),
      });
      toast.success(`تم تأكيد ${selectedItems.length} منتج`);
      setSelectedKeys(new Set());
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل تحديث العناصر');
    }
  }, [selectedKeys, items, checkMutation, status, onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تقرير منتجات الطلبات المؤكدة"
      showFooter={selectedKeys.size > 0}
      onConfirm={handleConfirm}
      confirmText={`تأكيد (${selectedKeys.size})`}
      confirmIcon={<LiaCheckCircleSolid className="w-5 h-5 text-white" />}
      confirmDisabled={selectedKeys.size === 0}
      isLoading={checkMutation.isPending}
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
            selectedKeys={selectedKeys}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
          />
        </TabsContent>

        <TabsContent value="sub">
          <WarehouseTab
            rows={items}
            isLoading={isLoading}
            warehouseName="المخزن الفرعي"
            selectedKeys={selectedKeys}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
          />
        </TabsContent>
      </Tabs>
    </BaseModal>
  );
}
