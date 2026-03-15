'use client';

import {
  LiaBoxesSolid,
  LiaCubesSolid,
  LiaExclamationTriangleSolid,
} from 'react-icons/lia';
import { LOW_STOCK_THRESHOLD } from '../constants';

interface SummaryCardsProps {
  totalProducts: number;
  totalQuantity: number;
  lowStockCount: number;
}

const cards = [
  {
    key: 'products',
    label: 'إجمالي المنتجات',
    icon: LiaCubesSolid,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    getValue: (p: SummaryCardsProps) => p.totalProducts,
  },
  {
    key: 'quantity',
    label: 'الكمية الكلية',
    icon: LiaBoxesSolid,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    getValue: (p: SummaryCardsProps) => p.totalQuantity,
  },
  {
    key: 'lowStock',
    label: 'مخزون منخفض',
    icon: LiaExclamationTriangleSolid,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    getValue: (p: SummaryCardsProps) => p.lowStockCount,
    suffix: `(<${LOW_STOCK_THRESHOLD})`,
  },
] as const;

export function SummaryCards(props: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className={`rounded-lg p-2.5 ${card.bgColor}`}>
              <Icon className={`size-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-gray-900">
                  {card.getValue(props).toLocaleString('ar-EG')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
