'use client';

import type { IconType } from 'react-icons';
import {
  LiaBoxesSolid,
  LiaCubesSolid,
  LiaExclamationTriangleSolid,
} from 'react-icons/lia';
import { LOW_STOCK_THRESHOLD } from '../constants';

export interface SummaryCardItem {
  key: string;
  label: string;
  value: number;
  icon: IconType;
  color: string;
  bgColor: string;
  suffix?: string;
}

interface SummaryCardsProps {
  items: SummaryCardItem[];
}

interface StockAnalysisCardsInput {
  totalProducts: number;
  totalQuantity: number;
  lowStockCount: number;
}

export function buildStockAnalysisCards({
  totalProducts,
  totalQuantity,
  lowStockCount,
}: StockAnalysisCardsInput): SummaryCardItem[] {
  return [
    {
      key: 'products',
      label: 'إجمالي المنتجات',
      icon: LiaCubesSolid,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      value: totalProducts,
    },
    {
      key: 'quantity',
      label: 'الكمية الكلية',
      icon: LiaBoxesSolid,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      value: totalQuantity,
    },
    {
      key: 'lowStock',
      label: 'مخزون منخفض',
      icon: LiaExclamationTriangleSolid,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      value: lowStockCount,
      suffix: `(<${LOW_STOCK_THRESHOLD})`,
    },
  ];
}

export function SummaryCards({ items }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((card) => {
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
                <span
                  className={`text-2xl font-bold ${
                    card.value < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  {card.value.toLocaleString('ar-EG')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
