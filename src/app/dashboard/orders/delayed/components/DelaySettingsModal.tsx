'use client';

import { useEffect, useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { useOrderStatusesQuery } from '@/services/orders';
import {
  useDelaySettingsQuery,
  useReplaceDelaySettings,
} from '@/services/delayedOrders';

interface DelaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MINUTES_PER_DAY = 1440;

/**
 * One row per order status with a threshold in DAYS. Blank means "not tracked"
 * — a status with no row is never delayed, which is why an empty input has to
 * clear the row rather than save a zero.
 */
export function DelaySettingsModal({ isOpen, onClose }: DelaySettingsModalProps) {
  const { data: statuses } = useOrderStatusesQuery();
  const { getStatusLabel } = useStatusLabel();
  const { data: settings, isLoading } = useDelaySettingsQuery();
  const { mutate: save, isPending } = useReplaceDelaySettings();

  const [days, setDays] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!settings) return;
    const next: Record<string, string> = {};
    for (const row of settings) {
      next[row.status] = String(row.delayMinutes / MINUTES_PER_DAY);
    }
    setDays(next);
  }, [settings]);

  const submit = () => {
    const rows = Object.entries(days)
      .map(([status, value]) => ({
        status,
        delayMinutes: Math.round(Number(value) * MINUTES_PER_DAY),
      }))
      // A blank or non-positive value means "stop tracking this status", not
      // "delay of zero".
      .filter((row) => Number.isFinite(row.delayMinutes) && row.delayMinutes > 0);

    save(rows, { onSuccess: onClose });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="إعدادات الطلبات المتأخرة"
      showFooter={false}
    >
      {isLoading ? (
        <PageLoading size="sm" className="py-8 min-h-0" />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-gray-500">
            حدد المدة التي بعدها يُعتبر الطلب متأخرًا في كل حالة. اترك الحقل
            فارغًا لعدم تتبع الحالة — الحالة بدون مدة لا تظهر أبدًا كمتأخرة.
          </p>

          <div className="max-h-[50vh] overflow-y-auto flex flex-col gap-2">
            {(statuses?.allStatuses ?? []).map((status) => (
              <div
                key={status.key}
                className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2"
              >
                <span className="text-sm text-gray-800">
                  {getStatusLabel(status.key)}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={days[status.key] ?? ''}
                    onChange={(e) =>
                      setDays((prev) => ({
                        ...prev,
                        [status.key]: e.target.value,
                      }))
                    }
                    placeholder="—"
                    className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm text-center"
                  />
                  <span className="text-xs text-gray-500">يوم</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" className="rounded-full px-6" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              variant="default"
              className="rounded-full px-6"
              disabled={isPending}
              onClick={submit}
            >
              {isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
