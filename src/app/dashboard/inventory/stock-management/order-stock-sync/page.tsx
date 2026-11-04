'use client';

import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import CopyableCode from '@/components/ui/copyable-code';
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
import { getApiErrorMessage, getOutOfStockBlock, outOfStockBlockText } from '@/utils/apiError';
import {
  useOrderStockDriftQuery,
  useRepairOrderStockMutation,
} from '@/services/orderStockSync';

const PAGE_SIZE = 50;

export default function OrderStockSyncPage() {
  const canRead = useHasPermission(PERMISSION_CODES.STOCK_MOVEMENTS_READ);
  const canRepair = useHasPermission(PERMISSION_CODES.STOCK_MOVEMENTS_REPAIR_ORDER);
  const [cursors, setCursors] = useState<(number | null)[]>([null]);
  const currentCursor = cursors[cursors.length - 1];
  const { data, isLoading, isError } = useOrderStockDriftQuery(currentCursor, PAGE_SIZE, canRead);
  const nextCursor = data?.nextCursor ?? null;

  const goNext = () => {
    if (nextCursor !== null) setCursors((stack) => [...stack, nextCursor]);
  };

  const goPrevious = () => setCursors((stack) => stack.slice(0, -1));
  const repair = useRepairOrderStockMutation();

  const handleRepair = (orderId: number) => {
    repair.mutate(orderId, {
      onSuccess: () => toast.success('تمت مزامنة مخزون الطلب'),
      onError: (err: unknown) => {
        const block = getOutOfStockBlock(err);
        if (block) {
          toast.error(outOfStockBlockText(block));
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
            onClick={goPrevious}
            disabled={cursors.length <= 1}
          >
            السابق
          </Button>
          <span className="text-sm text-gray-600">صفحة {cursors.length}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={goNext}
            disabled={nextCursor === null}
          >
            التالي
          </Button>
        </div>
      )}

      {data && data.items.length === 0 && nextCursor === null && (
        <p className="text-sm text-gray-500">لا توجد طلبات تحتاج مزامنة</p>
      )}

      {data && data.items.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>المنتج</TableHead>
                <TableHead>عدد القطع في الطلب</TableHead>
                <TableHead>المخزون المحجوز</TableHead>
                <TableHead>الفرق</TableHead>
                {canRepair && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item, index) => (
                <TableRow key={`${item.orderId}-${item.variantId}`}>
                  <TableCell>
                    <CopyableCode value={item.orderCode} label="نسخ كود الطلب">{item.orderCode}</CopyableCode>
                  </TableCell>
                  <TableCell>
                    {item.variantLabel
                      ? `${item.productName} – ${item.variantLabel}`
                      : item.productName}
                  </TableCell>
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
