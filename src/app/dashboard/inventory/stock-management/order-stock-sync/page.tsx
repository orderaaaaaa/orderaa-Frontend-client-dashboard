'use client';

import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { getApiErrorMessage, getOutOfStockBlock, formatStockShortageLines } from '@/utils/apiError';
import {
  useOrderStockDriftQuery,
  useRepairOrderStockMutation,
} from '@/services/orderStockSync';

const PAGE_SIZE = 50;

export default function OrderStockSyncPage() {
  const canRead = useHasPermission(PERMISSION_CODES.STOCK_MOVEMENTS_READ);
  const canRepair = useHasPermission(PERMISSION_CODES.STOCK_MOVEMENTS_REPAIR_ORDER);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useOrderStockDriftQuery(page, PAGE_SIZE, canRead);
  const repair = useRepairOrderStockMutation();

  const handleRepair = (orderId: number) => {
    repair.mutate(orderId, {
      onSuccess: () => toast.success('تمت مزامنة مخزون الطلب'),
      onError: (err: unknown) => {
        const block = getOutOfStockBlock(err);
        if (block) {
          const rows = formatStockShortageLines(block.lines);
          toast.error(rows ? `${block.message}\n${rows}` : block.message);
          return;
        }
        toast.error(getApiErrorMessage(err, 'تعذرت مزامنة مخزون الطلب'));
      },
    });
  };

  return (
    <div className="w-full max-w-full space-y-4 overflow-x-hidden p-4">
      <h1 className="text-lg font-semibold">مزامنة مخزون الطلبات</h1>
      <p className="text-sm text-gray-600">
        طلبات في مرحلة التجهيز لا يطابق مخزونها المحجوز عدد قطعها. المزامنة تنقل الفرق بين المخزون المحجوز والكمية الفعلية.
      </p>

      {isLoading && <p className="text-sm text-gray-500">جارٍ التحميل…</p>}
      {isError && <p className="text-sm text-red-600">تعذر تحميل الطلبات</p>}

      {data && (
        <div className="flex items-center justify-between gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((current) => current - 1)}
            disabled={page <= 1}
          >
            السابق
          </Button>
          <span className="text-sm text-gray-600">صفحة {page}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((current) => current + 1)}
            disabled={data.items.length < PAGE_SIZE}
          >
            التالي
          </Button>
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="text-sm text-gray-500">لا توجد طلبات تحتاج مزامنة</p>
      )}

      {data && data.items.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>رقم المتغير</TableHead>
                <TableHead>عدد القطع في الطلب</TableHead>
                <TableHead>المخزون المحجوز</TableHead>
                <TableHead>الفرق</TableHead>
                {canRepair && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item, index) => (
                <TableRow key={`${item.orderId}-${item.variantId}`}>
                  <TableCell>{item.orderCode}</TableCell>
                  <TableCell>{item.variantId}</TableCell>
                  <TableCell>{item.lines}</TableCell>
                  <TableCell>{item.net}</TableCell>
                  <TableCell className="text-red-600">{item.difference}</TableCell>
                  {canRepair && (
                    <TableCell>
                      {data.items.findIndex((other) => other.orderId === item.orderId) === index && (
                        <Button
                          size="sm"
                          onClick={() => handleRepair(item.orderId)}
                          disabled={repair.isPending}
                        >
                          مزامنة المخزون
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
