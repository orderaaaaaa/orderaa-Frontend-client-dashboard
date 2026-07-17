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
import Input from '@/components/ui/Input';
import { ShortfallSettlement } from '@/types/orders';
import {
  getShortfallSettlements,
  adjustSettlement,
} from '@/lib/api/settlement';

type FilterValue = 'all' | 'pending' | 'finished';

export default function ShortfallSettlementPage() {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [data, setData] = useState<ShortfallSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustAmounts, setAdjustAmounts] = useState<Record<number, string>>({});
  const [adjustingId, setAdjustingId] = useState<number | null>(null);

  const fetchData = useCallback(async (currentFilter: FilterValue) => {
    setLoading(true);
    try {
      const result = await getShortfallSettlements(currentFilter);
      setData(result);
    } catch {
      toast.error('فشل في تحميل بيانات التحصيل');
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

  const handleAdjust = async (orderId: number) => {
    const amountStr = adjustAmounts[orderId];
    if (!amountStr || amountStr.trim() === '') {
      toast.error('يرجى إدخال المبلغ');
      return;
    }

    const amount = Number(amountStr);
    if (Number.isNaN(amount)) {
      toast.error('يرجى إدخال رقم صحيح');
      return;
    }

    setAdjustingId(orderId);
    try {
      await adjustSettlement(orderId, amount);
      toast.success('تم تعديل التحصيل بنجاح');
      setAdjustAmounts((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      await fetchData(filter);
    } catch {
      toast.error('فشل في تعديل التحصيل');
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
          { title: 'الطلبات' },
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
                    <TableHead>تعديل</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="المبلغ"
                            value={adjustAmounts[row.id] ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleAdjustAmountChange(row.id, e.target.value)
                            }
                            className="w-28"
                            disabled={adjustingId === row.id}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAdjust(row.id)}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
