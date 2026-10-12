'use client';

import Link from 'next/link';
import { StackedList, StackedRow } from '@/components/ui/stacked-list';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import type { ProviderShipment } from '@/types/shippingProviders';
import { formatDate, formatNumber } from './formatNumber';

interface ShipmentsTableProps {
  shipments: ProviderShipment[];
}

export function ShipmentsTable({ shipments }: ShipmentsTableProps) {
  const { getStatusLabel } = useStatusLabel();

  const renderCode = (s: ProviderShipment) => (
    <Link href={`/dashboard/orders/${s.id}`} className="text-primary hover:underline">
      {s.code}
    </Link>
  );

  const renderTotal = (s: ProviderShipment) =>
    s.totalCost === null ? '—' : `${formatNumber(s.totalCost, 2)} جنيه`;

  return (
    <>
      <StackedList label="الشحنات" className="border-0 rounded-none">
        {shipments.map((s) => (
          <StackedRow
            key={s.id}
            title={<span className="font-mono">{renderCode(s)}</span>}
            fields={[
              { label: 'تاريخ الاستلام', value: formatDate(s.takenAt) },
              { label: 'الحالة', value: getStatusLabel(s.status) },
              { label: 'المحافظة', value: s.governorate ?? '—' },
              { label: 'المنطقة', value: s.city ?? '—' },
              { label: 'الإجمالي', value: renderTotal(s) },
            ]}
          />
        ))}
      </StackedList>
      <table className="hidden sm:table w-full text-sm" dir="rtl">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-right py-2 px-3 font-semibold text-gray-700">الكود</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-700">تاريخ الاستلام</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-700">الحالة</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-700">المحافظة</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-700">المنطقة</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-700">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => (
            <tr key={s.id} className="border-b border-gray-100">
              <td className="py-2 px-3 font-medium text-gray-900">{renderCode(s)}</td>
              <td className="py-2 px-3 text-gray-600">
                {formatDate(s.takenAt)}
              </td>
              <td className="py-2 px-3 text-gray-600">{getStatusLabel(s.status)}</td>
              <td className="py-2 px-3 text-gray-600">{s.governorate ?? '—'}</td>
              <td className="py-2 px-3 text-gray-600">{s.city ?? '—'}</td>
              <td className="py-2 px-3 text-gray-600">{renderTotal(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
