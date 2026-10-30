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
import { toStockNumber } from '@/utils/format';
import { STOCK_SCOPE_KINDS } from '../constants';
import type { SummaryCardItem } from '../components/SummaryCards';
import {
  ALL_STOCK_INDICATORS,
  indicatorsFromFlags,
  resolveIndicators,
  type StockIndicators,
} from '../utils/stockIndicators';
import type { StockScope } from '../types';

interface StockScopeSummary {
  name: string | null;
  notFound: boolean;
  items: SummaryCardItem[] | null;
  isLoading: boolean;
  indicators: StockIndicators | null;
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
      indicators: resolveIndicators(
        card,
        physicalSummary.isSuccess || physicalSummary.isError
      ),
      items: card
        ? presentCards([
            {
              key: 'quantity',
              label: 'الكمية الكلية',
              unit: 'quantity',
              icon: LiaBoxesSolid,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50',
              value: card.visibleTotalQuantity,
            },
            card.showLowStockIndicator
              ? {
                  key: 'lowStock',
                  label: 'مخزون منخفض',
                  unit: 'variant',
                  icon: LiaExclamationTriangleSolid,
                  color: 'text-amber-600',
                  bgColor: 'bg-amber-50',
                  value: toStockNumber(card.lowStockVariantCount),
                }
              : null,
            indicatorsFromFlags(card).outOfStock
              ? {
                  key: 'outOfStock',
                  label: 'غير متوفر',
                  unit: 'variant',
                  icon: LiaTimesCircleSolid,
                  color: 'text-red-600',
                  bgColor: 'bg-red-50',
                  value: toStockNumber(card.outOfStockVariantCount),
                }
              : null,
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
      indicators: resolveIndicators(
        card ?? virtualWarehouse.data,
        (virtualSummary.isSuccess || virtualSummary.isError || !canReadVirtual) &&
          (virtualWarehouse.isSuccess || virtualWarehouse.isError || !canReadVirtual)
      ),
      items: card
        ? presentCards([
            {
              key: 'quantity',
              label: 'الكمية الكلية',
              unit: 'quantity',
              icon: LiaBoxesSolid,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50',
              value: card.visibleTotalQuantity,
            },
            indicatorsFromFlags(card).outOfStock
              ? {
                  key: 'outOfStock',
                  label: 'غير متوفر',
                  unit: 'variant',
                  icon: LiaTimesCircleSolid,
                  color: 'text-amber-600',
                  bgColor: 'bg-amber-50',
                  value: toStockNumber(card.outOfStockVariantCount),
                }
              : null,
            card.showShortageIndicator
              ? {
                  key: 'shortfall',
                  label: 'العجز',
                  unit: 'quantity',
                  icon: LiaMinusCircleSolid,
                  color: 'text-red-600',
                  bgColor: 'bg-red-50',
                  value: toStockNumber(card.shortfallUnits),
                }
              : null,
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
