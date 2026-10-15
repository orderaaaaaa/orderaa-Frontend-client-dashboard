'use client';

import { useState } from 'react';
import clsx from 'clsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from '@/components/ui/tooltip';
import BaseModal from '@/components/ui/base-modal';
import { useIsMobile } from '@/hooks/useIsMobile';
import { STOCK_STATUS_CONFIG } from '../constants';
import { formatStockNumber } from '../utils/formatNumber';
import {
  displayCell,
  sumVisibleQuantity,
  type StockCellView,
  type StockIndicators,
} from '../utils/stockIndicators';
import type { StockProduct, VariantStock, ProductVariantRow } from '../types';

interface SelectedCell {
  stock: VariantStock;
  color: string;
  size: string;
  showStatus: boolean;
}

function StockBadge({ stock }: { stock: VariantStock }) {
  const config = STOCK_STATUS_CONFIG[stock.status];

  if (stock.status === 'shortage') {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-semibold text-red-600" dir="ltr">
          {formatStockNumber(stock.quantity)}
        </span>
        <span
          className={clsx(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            config.bgColor,
            config.color
          )}
        >
          <span className={clsx('size-1.5 rounded-full', config.dotColor)} />
          {config.label}
        </span>
      </div>
    );
  }

  if (stock.status === 'out_of_stock') {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-semibold text-gray-400 line-through">
          {formatStockNumber(0)}
        </span>
        <span
          className={clsx(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            config.bgColor,
            config.color
          )}
        >
          <span className={clsx('size-1.5 rounded-full', config.dotColor)} />
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm font-semibold text-gray-800">
        {formatStockNumber(stock.quantity)}
      </span>
      <span
        className={clsx(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
          config.bgColor,
          config.color
        )}
      >
        <span className={clsx('size-1.5 rounded-full', config.dotColor)} />
        {config.label}
      </span>
    </div>
  );
}

function StockCellValue({ view }: { view: StockCellView }) {
  if (view.kind === 'badge') return <StockBadge stock={view.stock} />;
  if (view.kind === 'plain') {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-semibold text-gray-800">
          {formatStockNumber(view.stock.quantity)}
        </span>
      </div>
    );
  }
  if (view.kind === 'missing') {
    return (
      <div className="flex items-center justify-center">
        <span className="text-sm text-gray-300">-</span>
      </div>
    );
  }
  return null;
}

interface ProductStockTableProps {
  product: StockProduct;
  filterColor?: string;
  filterSize?: string;
  indicators: StockIndicators;
}

export function ProductStockTable({
  product,
  filterColor,
  filterSize,
  indicators,
}: ProductStockTableProps) {
  const isMobile = useIsMobile();
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);

  const visibleColors = filterColor
    ? product.colors.filter((c) => c === filterColor)
    : product.colors;

  const visibleVariants = filterSize
    ? product.variants.filter((v) => v.size === filterSize)
    : product.variants;

  const columnTotals = visibleColors.map((color) =>
    sumVisibleQuantity(
      visibleVariants.map((variant) => variant.stocks[color]),
      indicators
    )
  );

  const rowTotal = (variant: ProductVariantRow) =>
    sumVisibleQuantity(
      visibleColors.map((color) => variant.stocks[color]),
      indicators
    );

  const renderGridCell = (view: StockCellView, color: string, size: string) => {
    if (view.kind === 'hidden') return null;
    if (view.kind === 'missing') return <StockCellValue view={view} />;
    const { stock } = view;
    const showStatus = view.kind === 'badge';

    if (isMobile) {
      return (
        <button
          type="button"
          className="w-full cursor-pointer"
          onClick={() => setSelectedCell({ stock, color, size, showStatus })}
        >
          <StockCellValue view={view} />
        </button>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-default">
            <StockCellValue view={view} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="flex flex-row items-center gap-2 font-semibold whitespace-nowrap">
            <span>{formatStockNumber(stock.quantity)}</span>
            <span>{color}</span>
            <span>{size}</span>
          </div>
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    );
  };

  const grandTotal = columnTotals.reduce((sum, total) => sum + total, 0);

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-4">
        <div className="size-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="min-w-0">
          <h3 className="break-words text-base font-bold text-gray-900">{product.name}</h3>
          {/* <p className="text-sm text-gray-400">SKU: {product.sku}</p> */}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4 md:hidden">
        {visibleVariants.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">لا توجد متغيرات مطابقة</p>
        ) : (
          <>
            {visibleVariants.map((variant) => (
              <div key={variant.size} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2">
                  <span className="min-w-0 break-words font-semibold text-gray-800">
                    {variant.size}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-gray-800">
                    {formatStockNumber(rowTotal(variant))}
                  </span>
                </div>
                <div className="flex flex-col">
                  {visibleColors.map((color) => {
                    const view = displayCell(variant.stocks[color], indicators);
                    const label = (
                      <span className="min-w-0 break-words text-sm text-gray-600">{color}</span>
                    );

                    if (view.kind === 'badge' || view.kind === 'plain') {
                      return (
                        <button
                          key={color}
                          type="button"
                          className="flex min-h-10 w-full items-center justify-between gap-3 text-start"
                          onClick={() =>
                            setSelectedCell({
                              stock: view.stock,
                              color,
                              size: variant.size,
                              showStatus: view.kind === 'badge',
                            })
                          }
                        >
                          {label}
                          <StockCellValue view={view} />
                        </button>
                      );
                    }

                    return (
                      <div
                        key={color}
                        className="flex min-h-10 items-center justify-between gap-3"
                      >
                        {label}
                        <StockCellValue view={view} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
              <span className="text-xs font-bold text-gray-600">عدد الإجمالي لكل متغير</span>
              {columnTotals.map((total, idx) => (
                <div
                  key={visibleColors[idx]}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 break-words text-gray-600">{visibleColors[idx]}</span>
                  <span className="font-bold text-gray-800">{formatStockNumber(total)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-2 text-sm">
                <span className="font-bold text-gray-600">الإجمالي</span>
                <span className="font-bold text-primary">{formatStockNumber(grandTotal)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f1eefa]">
              <TableHead className="sticky start-0 z-[1] bg-[#f1eefa] px-4 py-3 text-sm font-bold text-gray-700 border-l border-gray-200 last:border-l-0 w-24 text-center">
                المتغير
              </TableHead>
              {visibleColors.map((color) => (
                <TableHead
                  key={color}
                  className="px-4 py-3 text-sm font-bold text-gray-700 border-l border-gray-200 last:border-l-0 text-center"
                >
                  {color}
                </TableHead>
              ))}
              <TableHead className="px-4 py-3 text-sm font-bold text-gray-700 border-l border-gray-200 last:border-l-0 text-center">
                الإجمالي
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleVariants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColors.length + 2}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  لا توجد متغيرات مطابقة
                </TableCell>
              </TableRow>
            ) : (
              <>
                {visibleVariants.map((variant) => (
                  <TableRow key={variant.size} className="group hover:bg-gray-50">
                    <TableCell className="sticky start-0 z-[1] bg-white group-hover:bg-gray-50 transition-colors px-4 py-3 text-center text-sm font-semibold text-gray-800 border-l border-gray-200 last:border-l-0">
                      {variant.size}
                    </TableCell>
                    {visibleColors.map((color) => (
                      <TableCell
                        key={color}
                        className="px-4 py-3 border-l border-gray-200 last:border-l-0"
                      >
                        {renderGridCell(
                          displayCell(variant.stocks[color], indicators),
                          color,
                          variant.size
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-l border-gray-200 last:border-l-0">
                      {formatStockNumber(rowTotal(variant))}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 border-t-2 border-gray-200">
                  <TableCell className="sticky start-0 z-[1] bg-gray-50 px-4 py-3 text-center text-xs font-bold text-gray-600 border-l border-gray-200 last:border-l-0">
                    عدد الإجمالي لكل متغير
                  </TableCell>
                  {columnTotals.map((total, idx) => (
                    <TableCell
                      key={visibleColors[idx]}
                      className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-l border-gray-200 last:border-l-0"
                    >
                      {formatStockNumber(total)}
                    </TableCell>
                  ))}
                  <TableCell className="px-4 py-3 text-center text-sm font-bold text-primary border-l border-gray-200 last:border-l-0">
                    {formatStockNumber(grandTotal)}
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <BaseModal
        isOpen={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        title="تفاصيل المخزون"
        showFooter={false}
      >
        {selectedCell && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">المنتج</span>
              <span className="font-semibold text-gray-800">{product.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">المتغير</span>
              <span className="font-semibold text-gray-800">{selectedCell.size}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">اللون</span>
              <span className="font-semibold text-gray-800">{selectedCell.color}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">الكمية</span>
              <span className="font-semibold text-gray-800">{formatStockNumber(selectedCell.stock.quantity)}</span>
            </div>
            {selectedCell.showStatus && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">الحالة</span>
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    STOCK_STATUS_CONFIG[selectedCell.stock.status].bgColor,
                    STOCK_STATUS_CONFIG[selectedCell.stock.status].color
                  )}
                >
                  <span
                    className={clsx(
                      'size-1.5 rounded-full',
                      STOCK_STATUS_CONFIG[selectedCell.stock.status].dotColor
                    )}
                  />
                  {STOCK_STATUS_CONFIG[selectedCell.stock.status].label}
                </span>
              </div>
            )}
          </div>
        )}
      </BaseModal>
    </div>
  );
}
