'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { LiaPlusSolid, LiaTruckSolid, LiaUserSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import PageLoading from '@/components/ui/page-loading';
import {
  useCarrierStatsQuery,
  useUpdateShippingProvider,
} from '@/services/shippingProviders';
import type { CarrierStats } from '@/types/shippingProviders';
import { AddProviderModal } from './AddProviderModal';
import { CarrierDetail } from './CarrierDetail';
import { RateBadge } from './RateBadge';

type TypeFilter = 'ALL' | 'COMPANY' | 'DELEGATE';

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'DELEGATE', label: 'المناديب' },
  { value: 'COMPANY', label: 'شركات الشحن' },
];

export function ShippingProvidersContent() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [showInactive, setShowInactive] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const range = useMemo(
    () => ({ from: from || undefined, to: to || undefined }),
    [from, to],
  );

  const { data: carriers = [], isLoading } = useCarrierStatsQuery(range);
  const { mutate: updateProvider } = useUpdateShippingProvider();

  const visible = carriers.filter((c) => {
    // Integrated carriers have no type and are always shown: goal 5 puts them
    // on the same page with the same statistics.
    if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;
    if (!showInactive && !c.isActive) return false;
    return true;
  });

  const selected = carriers.find((c) => c.key === selectedKey) ?? null;

  const retire = (carrier: CarrierStats, isActive: boolean) => {
    const id = Number(carrier.key.split(':')[1]);
    updateProvider({ id, isActive });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="sm:px-8 py-4 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              مناديب الشحن وشركات الشحن
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              نسب التسليم والاسترجاع تُحسب من الطلبات المنتهية فقط، والشحنات
              الجارية تُعرض كعدد مستقل
            </p>
          </div>

          <Button
            variant="default"
            className="w-fit rounded-full font-semibold flex items-center gap-2"
            onClick={() => setIsAddOpen(true)}
          >
            <LiaPlusSolid className="w-5 h-5" />
            إضافة جهة شحن
          </Button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex gap-2">
            {TYPE_FILTERS.map((f) => (
              <Button
                key={f.value}
                type="button"
                variant={typeFilter === f.value ? 'default' : 'outline'}
                size="sm"
                className="rounded-full text-xs px-4"
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          <Input
            type="date"
            label="من"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            label="إلى"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />

          <label className="flex items-center gap-2 text-xs text-gray-600 pb-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            إظهار غير النشطة
          </label>
        </div>

        {isLoading ? (
          <PageLoading message="جاري تحميل جهات الشحن..." />
        ) : visible.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">
            لا توجد جهات شحن — أضف مندوبًا أو شركة شحن للبدء
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((carrier) => {
              const finished = carrier.deliveredCount + carrier.returnedCount;
              const isProvider = carrier.key.startsWith('provider:');

              return (
                <div
                  key={carrier.key}
                  className={clsx(
                    'border rounded-xl p-4 flex flex-col gap-3 bg-white transition-colors cursor-pointer',
                    selectedKey === carrier.key
                      ? 'border-primary'
                      : 'border-gray-200 hover:border-primary/40',
                    !carrier.isActive && 'opacity-60',
                  )}
                  onClick={() =>
                    setSelectedKey(
                      selectedKey === carrier.key ? null : carrier.key,
                    )
                  }
                >
                  <div className="flex items-start gap-2">
                    {carrier.type === 'DELEGATE' ? (
                      <LiaUserSolid className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    ) : (
                      <LiaTruckSolid className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {carrier.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {carrier.phone ??
                          (isProvider ? 'بدون رقم' : 'شركة شحن مدمجة')}
                      </p>
                    </div>
                    {!carrier.isActive && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        غير نشط
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">شحنات حالية</span>
                    <span className="text-lg font-bold text-gray-900">
                      {carrier.inTransitCount}
                    </span>
                  </div>

                  <div className="flex gap-4 border-t border-gray-100 pt-2">
                    <RateBadge
                      label="تسليم"
                      rate={carrier.deliveryRate}
                      part={carrier.deliveredCount}
                      total={finished}
                      tone="delivered"
                    />
                    <RateBadge
                      label="استرجاع"
                      rate={carrier.returnRate}
                      part={carrier.returnedCount}
                      total={finished}
                      tone="returned"
                    />
                  </div>

                  {/* Integrated carriers come from the enum, not the table, so
                      they cannot be edited or retired. */}
                  {isProvider && (
                    <button
                      type="button"
                      className="self-start text-xs text-gray-500 hover:text-red-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        retire(carrier, !carrier.isActive);
                      }}
                    >
                      {carrier.isActive ? 'إيقاف' : 'إعادة تفعيل'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selected && (
          <CarrierDetail
            carrier={selected}
            range={range}
            onClose={() => setSelectedKey(null)}
          />
        )}
      </div>

      <AddProviderModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  );
}
