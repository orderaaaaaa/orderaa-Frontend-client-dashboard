'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Breadcrumb } from '@/components/dashboard-layout/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import { getApiErrorMessage } from '@/utils/apiError';
import { ShortfallSettlement } from '@/types/orders';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  getShortfallSettlements,
  adjustSettlement,
} from '@/lib/api/settlement';

type FilterValue = 'all' | 'pending' | 'finished';

const AMOUNT_PATTERN = /^-?\d+(\.\d{1,2})?$/;

interface PendingAdjust {
  row: ShortfallSettlement;
  delta: number;
}

function formatMoney(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

export default function ShortfallSettlementPage() {
  // Adjusting a settlement hits PATCH /orders/settlement/:orderId/adjust.
  const canManageSettlement = useHasPermission(PERMISSION_CODES.ORDERS_SETTLEMENT_MANAGE);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [data, setData] = useState<ShortfallSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustAmounts, setAdjustAmounts] = useState<Record<number, string>>({});
  const [adjustingId, setAdjustingId] = useState<number | null>(null);
  const [pendingAdjust, setPendingAdjust] = useState<PendingAdjust | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const fetchData = useCallback(async (currentFilter: FilterValue) => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const result = await getShortfallSettlements(currentFilter);
      setData(result);
    } catch (err) {
      setData([]);
      setLoadFailed(true);
      toast.error(getApiErrorMessage(err, 'فشل في تحميل بيانات التحصيل'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filter);
  }, [filter, fetchData]);

  const handleFilterChange = (value: string) => {
    setFilter(value as FilterValue);
  };

  const handleAdjustAmountChange = (orderId: number, value: string) => {
    setAdjustAmounts((prev) => ({ ...prev, [orderId]: value }));
  };

  const requestAdjust = (row: ShortfallSettlement) => {
    const amountStr = (adjustAmounts[row.id] ?? '').trim();
    if (amountStr === '') {
      toast.error('يرجى إدخال المبلغ');
      return;
    }
    if (!AMOUNT_PATTERN.test(amountStr)) {
      toast.error('أدخل مبلغًا صحيحًا بحد أقصى رقمين عشريين');
      return;
    }
    const delta = Number(amountStr);
    if (delta === 0) {
      toast.error('التعديل لا يمكن أن يساوي صفرًا');
      return;
    }
    setPendingAdjust({ row, delta });
  };

  const handleAdjust = async () => {
    if (!pendingAdjust) return;
    const { row, delta } = pendingAdjust;
    setAdjustingId(row.id);
    try {
      await adjustSettlement(row.id, delta);
      toast.success('تم تعديل التحصيل بنجاح');
      setAdjustAmounts((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      setPendingAdjust(null);
      await fetchData(filter);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'فشل في تعديل التحصيل'));
    } finally {
      setAdjustingId(null);
    }
  };

  const tabs = [
    { value: 'all', label: 'كل' },
    { value: 'pending', label: 'معلق' },
    { value: 'finished', label: 'منتهي' },
  ];

  return (
    <div className="flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full min-h-full">
      <Breadcrumb
        items={[
          { title: 'التحصيلات' },
          { title: 'تحصيل ناقص' },
        ]}
      />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">تحصيل ناقص</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={filter} onValueChange={handleFilterChange}>
            <TabsList className="mb-4">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-sm">
                  جاري التحميل...
                </p>
              </div>
            ) : loadFailed ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <p className="text-red-700 text-sm font-semibold">
                  تعذّر تحميل بيانات التحصيل
                </p>
                <Button variant="outline" size="sm" onClick={() => fetchData(filter)}>
                  إعادة المحاولة
                </Button>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-sm">
                  لا توجد بيانات تحصيل ناقص
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>كود الطلب</TableHead>
                    <TableHead>مبلغ التحصيل</TableHead>
                    <TableHead>الحالة</TableHead>
                    {canManageSettlement && <TableHead>تعديل (+/−)</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.code}
                      </TableCell>
                      <TableCell>{Number(row.settlementAmount)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.settlementResolved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {row.settlementResolved ? 'منتهي' : 'معلق'}
                        </span>
                      </TableCell>
                      {canManageSettlement && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            dir="ltr"
                            aria-label={`تعديل (+/−) للطلب ${row.code}`}
                            placeholder="± المبلغ"
                            value={adjustAmounts[row.id] ?? ''}
                            onChange={(e) =>
                              handleAdjustAmountChange(row.id, e.target.value)
                            }
                            className="w-28 border border-gray-200 rounded-md px-3 py-2 text-base sm:text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                            disabled={adjustingId === row.id}
                          />
                          <Button
                            size="sm"
                            onClick={() => requestAdjust(row)}
                            disabled={
                              adjustingId === row.id ||
                              !adjustAmounts[row.id] ||
                              adjustAmounts[row.id].trim() === ''
                            }
                            loading={adjustingId === row.id}
                          >
                            تأكيد
                          </Button>
                        </div>
                      </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <BaseModal
        isOpen={pendingAdjust !== null}
        onClose={() => setPendingAdjust(null)}
        onConfirm={handleAdjust}
        title="تأكيد تعديل التحصيل"
        confirmText="تأكيد التعديل"
        isLoading={adjustingId !== null}
        maxWidth="md:max-w-md"
      >
        {pendingAdjust && (
          <div className="space-y-3 text-sm">
            <p className="font-medium">الطلب {pendingAdjust.row.code}</p>
            <p dir="rtl">
              التحصيل الحالي {formatMoney(Number(pendingAdjust.row.settlementAmount))} + التعديل{' '}
              <span dir="ltr">{formatMoney(pendingAdjust.delta)}</span> ={' '}
              <b>
                {formatMoney(
                  Number(pendingAdjust.row.settlementAmount) + pendingAdjust.delta,
                )}{' '}
                جنيه
              </b>
            </p>
            <p className="text-amber-700">التعديل يُضاف إلى التحصيل الحالي ولا يستبدله</p>
          </div>
        )}
      </BaseModal>
    </div>
  );
}
