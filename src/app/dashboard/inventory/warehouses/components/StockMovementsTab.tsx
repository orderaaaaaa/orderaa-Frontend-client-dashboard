'use client';

import { LiaExchangeAltSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import PaginationFooter from '@/components/ui/pagination-footer';
import PageLoading from '@/components/ui/page-loading';
import { useWarehouseOptions } from '@/services/warehouses';
import type { StockMovementApiItem } from '@/lib/api/warehouses';
import { ALL_WAREHOUSES_OPTION } from '@/constants/warehouses';
import {
  MOVEMENT_SOURCE_CLASSES,
  MOVEMENT_SOURCE_LABELS,
  MOVEMENT_SOURCE_OPTIONS,
  REFERENCE_TYPE_LABELS,
} from '../constants';
import { useMovementsFilters } from '../hooks/useMovementsFilters';

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * Signed quantity from the selected warehouse's point of view: stock leaving
 * the filtered warehouse reads negative. Without a warehouse filter the raw
 * quantity is shown (already signed for adjustments).
 */
const signedQuantity = (
  movement: StockMovementApiItem,
  warehouseId: number | null
): number => {
  // ADJUSTMENT quantities arrive already signed AND negative ones carry
  // fromWarehouseId — negating again would render a write-off as a gain.
  if (movement.source === 'ADJUSTMENT') return movement.quantity;
  if (warehouseId == null) return movement.quantity;
  if (movement.fromWarehouseId === warehouseId) return -movement.quantity;
  return movement.quantity;
};

export function StockMovementsTab() {
  const {
    filters,
    setSource,
    setWarehouseId,
    setFromDate,
    setToDate,
    setTimePeriod,
    resetFilters,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    handlePageSizeChange,
    query,
  } = useMovementsFilters();

  const { options: warehouseOptions } = useWarehouseOptions();
  const { data, isLoading, isFetching, isError } = query;

  const movements = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalItems = data?.total ?? 0;
  const selectedWarehouseId = filters.warehouseId
    ? Number(filters.warehouseId)
    : null;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SearchableSelect
            options={MOVEMENT_SOURCE_OPTIONS}
            value={filters.source}
            onValueChange={setSource}
            placeholder="المصدر"
          />
          <SearchableSelect
            options={[ALL_WAREHOUSES_OPTION, ...warehouseOptions]}
            value={filters.warehouseId}
            onValueChange={setWarehouseId}
            placeholder="المخزن"
          />
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter
            fromDate={filters.fromDate}
            toDate={filters.toDate}
            timePeriod={filters.timePeriod}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onTimePeriodChange={setTimePeriod}
            className="!justify-start"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-primary hover:underline whitespace-nowrap"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <PageLoading size="sm" className="min-h-0 py-10" />
      ) : isError ? (
        <p className="py-10 text-center text-sm text-red-500">
          تعذر تحميل سجل حركات المخزون
        </p>
      ) : movements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <LiaExchangeAltSolid className="mb-4 size-16" />
          <p className="text-lg font-medium text-gray-500">
            لا توجد حركات مخزون
          </p>
        </div>
      ) : (
        <div
          className={`overflow-x-auto transition-opacity ${
            isFetching ? 'opacity-60' : ''
          }`}
        >
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-3 px-3 text-right font-semibold text-gray-700">
                  التاريخ
                </th>
                <th className="py-3 px-3 text-right font-semibold text-gray-700">
                  المصدر
                </th>
                <th className="py-3 px-3 text-right font-semibold text-gray-700">
                  المنتج / المتغير
                </th>
                <th className="py-3 px-3 text-right font-semibold text-gray-700">
                  الكمية
                </th>
                <th className="py-3 px-3 text-right font-semibold text-gray-700">
                  من مخزن
                </th>
                <th className="py-3 px-3 text-right font-semibold text-gray-700">
                  إلى مخزن
                </th>
                <th className="py-3 px-3 text-right font-semibold text-gray-700">
                  المرجع
                </th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => {
                const quantity = signedQuantity(movement, selectedWarehouseId);
                return (
                  <tr
                    key={movement.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap text-gray-600">
                      {formatDate(movement.createdAt)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${MOVEMENT_SOURCE_CLASSES[movement.source]}`}
                      >
                        {MOVEMENT_SOURCE_LABELS[movement.source]}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-gray-900">
                        {movement.variant.product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {movement.variant.sku ?? movement.variant.combinationKey}
                      </p>
                    </td>
                    <td
                      className={`py-2.5 px-3 font-semibold ${
                        quantity < 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {quantity > 0 ? `+${quantity}` : quantity}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {movement.fromWarehouse?.name ?? '—'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {movement.toWarehouse?.name ?? '—'}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-500">
                      <span className="font-medium">
                        {REFERENCE_TYPE_LABELS[movement.referenceType] ??
                          movement.referenceType}
                      </span>
                      <span className="mr-1 text-gray-400">
                        {movement.referenceId.length > 12
                          ? `${movement.referenceId.slice(0, 12)}…`
                          : movement.referenceId}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && totalPages > 0 && (
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          hasNextPage={currentPage < totalPages}
          hasPreviousPage={currentPage > 1}
          onPageChange={setCurrentPage}
          onPrevious={() => setCurrentPage(Math.max(1, currentPage - 1))}
          onNext={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          currentPageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
