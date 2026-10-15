import {
  LiaBoxesSolid,
  LiaExclamationTriangleSolid,
  LiaMinusCircleSolid,
  LiaTimesCircleSolid,
} from 'react-icons/lia';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  useVirtualWarehouseQuery,
  useVirtualWarehouseSummaryQuery,
} from '@/services/virtualWarehouses';
import { useWarehouseSummaryQuery } from '@/services/warehouses';
import { STOCK_SCOPE_KINDS } from '../constants';
import type { SummaryCardItem } from '../components/SummaryCards';
import {
  ALL_STOCK_INDICATORS,
  indicatorsFromFlags,
  type StockIndicators,
} from '../utils/stockIndicators';
import type { StockScope } from '../types';

interface StockScopeSummary {
  name: string | null;
  notFound: boolean;
  items: SummaryCardItem[] | null;
  isLoading: boolean;
  indicators: StockIndicators;
}

function presentCards(
  cards: (SummaryCardItem | null)[]
): SummaryCardItem[] {
  return cards.filter((card): card is SummaryCardItem => card !== null);
}

export function useStockScopeSummary(scope: StockScope): StockScopeSummary {
  const isPhysical = scope.kind === STOCK_SCOPE_KINDS.PHYSICAL;
  const isVirtual = scope.kind === STOCK_SCOPE_KINDS.VIRTUAL;
  const scopeId = scope.id;
  const canReadVirtual = useHasPermission(
    PERMISSION_CODES.VIRTUAL_WAREHOUSES_READ
  );

  const physicalSummary = useWarehouseSummaryQuery({ enabled: isPhysical });
  const virtualSummary = useVirtualWarehouseSummaryQuery({
    enabled: isVirtual && canReadVirtual,
  });
  const virtualWarehouse = useVirtualWarehouseQuery(
    isVirtual ? scopeId : undefined,
    { enabled: canReadVirtual }
  );

  if (isPhysical) {
    const card = physicalSummary.data?.find((item) => item.id === scopeId);
    return {
      name: card?.name ?? null,
      notFound: false,
      isLoading: physicalSummary.isLoading,
      indicators: indicatorsFromFlags(card),
      items: card
        ? presentCards([
            {
              key: 'quantity',
              label: 'الكمية الكلية',
              icon: LiaBoxesSolid,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50',
              value: card.visibleTotalQuantity,
            },
            card.lowStockVariantCount === null
              ? null
              : {
                  key: 'lowStock',
                  label: 'مخزون منخفض',
                  icon: LiaExclamationTriangleSolid,
                  color: 'text-amber-600',
                  bgColor: 'bg-amber-50',
                  value: card.lowStockVariantCount,
                },
            card.outOfStockVariantCount === null
              ? null
              : {
                  key: 'outOfStock',
                  label: 'غير متوفر',
                  icon: LiaTimesCircleSolid,
                  color: 'text-red-600',
                  bgColor: 'bg-red-50',
                  value: card.outOfStockVariantCount,
                },
          ])
        : null,
    };
  }

  if (isVirtual) {
    const card = virtualSummary.data?.find((item) => item.id === scopeId);
    const detailStatus = (
      virtualWarehouse.error as { response?: { status?: number } } | null
    )?.response?.status;
    return {
      name: virtualWarehouse.data?.name ?? card?.name ?? null,
      notFound: !canReadVirtual || detailStatus === 404,
      isLoading: virtualSummary.isLoading || virtualWarehouse.isLoading,
      indicators: indicatorsFromFlags(virtualWarehouse.data ?? card),
      items: card
        ? presentCards([
            {
              key: 'quantity',
              label: 'الكمية الكلية',
              icon: LiaBoxesSolid,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50',
              value: card.visibleTotalQuantity,
            },
            card.outOfStockVariantCount === null
              ? null
              : {
                  key: 'outOfStock',
                  label: 'غير متوفر',
                  icon: LiaTimesCircleSolid,
                  color: 'text-amber-600',
                  bgColor: 'bg-amber-50',
                  value: card.outOfStockVariantCount,
                },
            card.shortfallUnits === null
              ? null
              : {
                  key: 'shortfall',
                  label: 'العجز',
                  icon: LiaMinusCircleSolid,
                  color: 'text-red-600',
                  bgColor: 'bg-red-50',
                  value: card.shortfallUnits,
                },
          ])
        : null,
    };
  }

  return {
    name: null,
    notFound: false,
    items: null,
    isLoading: false,
    indicators: ALL_STOCK_INDICATORS,
  };
}
