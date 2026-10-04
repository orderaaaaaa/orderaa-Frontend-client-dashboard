'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { LiaTimesSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import { useCarrierLocationStatsQuery } from '@/services/shippingProviders';
import type { CarrierStats, StatsRange } from '@/types/shippingProviders';
import { RateBadge } from './RateBadge';

interface CarrierDetailProps {
  carrier: CarrierStats;
  range: StatsRange;
  onClose: () => void;
}

type Tab = 'governorates' | 'regions';

const TABS: { value: Tab; label: string }[] = [
  { value: 'governorates', label: 'المحافظات' },
  { value: 'regions', label: 'المناطق' },
];

export function CarrierDetail({ carrier, range, onClose }: CarrierDetailProps) {
  const [tab, setTab] = useState<Tab>('governorates');

  const { data: locations = [], isLoading: loadingLocations } =
    useCarrierLocationStatsQuery(
      carrier.shippingCompanyId,
      tab === 'governorates' ? 'governorates' : 'regions',
      range,
    );

  const finished = carrier.deliveredCount + carrier.returnedCount;

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900">{carrier.name}</h3>
            {carrier.type && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                {carrier.type === 'DELEGATE' ? 'مندوب' : 'شركة شحن'}
              </span>
            )}
            {carrier.phone && (
              <span className="text-sm text-gray-500">{carrier.phone}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-500">شحنات جارية</span>
              <span className="text-sm font-bold text-gray-900">
                {carrier.inTransitCount}
              </span>
            </div>
            <RateBadge
              label="نسبة التسليم"
              rate={carrier.deliveryRate}
              part={carrier.deliveredCount}
              total={finished}
              tone="delivered"
            />
            <RateBadge
              label="نسبة الاسترجاع"
              rate={carrier.returnRate}
              part={carrier.returnedCount}
              total={finished}
              tone="returned"
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 shrink-0"
        >
          <LiaTimesSolid className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2 px-4 sm:px-6 py-3 border-b border-gray-100">
        {TABS.map((t) => (
          <Button
            key={t.value}
            type="button"
            variant={tab === t.value ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs px-4"
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="px-2 sm:px-4 py-3 overflow-x-auto">
        {loadingLocations ? (
          <PageLoading size="sm" className="py-6 min-h-0" />
        ) : locations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            لا توجد طلبات منتهية في هذه الفترة
          </p>
        ) : (
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-right py-2 px-3 font-semibold text-gray-700">
                  {tab === 'governorates' ? 'المحافظة' : 'المنطقة'}
                </th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">تم التسليم</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">مرتجع</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">نسبة التسليم</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">نسبة الاسترجاع</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((row) => (
                <tr key={row.location ?? 'unknown'} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-medium text-gray-900">
                    {row.location ?? 'غير محدد'}
                  </td>
                  <td className="py-2 px-3 text-gray-600">{row.deliveredCount}</td>
                  <td className="py-2 px-3 text-gray-600">{row.returnedCount}</td>
                  <td className={clsx('py-2 px-3 font-semibold text-green-600')}>
                    {row.deliveryRate === null ? '—' : `${row.deliveryRate}%`}
                  </td>
                  <td className="py-2 px-3 font-semibold text-amber-600">
                    {row.returnRate === null ? '—' : `${row.returnRate}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
