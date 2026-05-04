'use client';

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
import { STOCK_STATUS_CONFIG } from '../constants';
import type { StockProduct, VariantStock } from '../types';

function StockBadge({ stock }: { stock: VariantStock }) {
  const config = STOCK_STATUS_CONFIG[stock.status];

  if (stock.status === 'out_of_stock') {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-semibold text-gray-400 line-through">
          0
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
        {stock.quantity}
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

interface ProductStockTableProps {
  product: StockProduct;
  filterColor?: string;
  filterSize?: string;
}

export function ProductStockTable({
  product,
  filterColor,
  filterSize,
}: ProductStockTableProps) {
  const visibleColors = filterColor
    ? product.colors.filter((c) => c === filterColor)
    : product.colors;

  const visibleVariants = filterSize
    ? product.variants.filter((v) => v.size === filterSize)
    : product.variants;

  const columnTotals = visibleColors.map((color) =>
    visibleVariants.reduce(
      (sum, variant) => sum + (variant.stocks[color]?.quantity ?? 0),
      0
    )
  );

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
        <div>
          <h3 className="text-base font-bold text-gray-900">{product.name}</h3>
          {/* <p className="text-sm text-gray-400">SKU: {product.sku}</p> */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f1eefa]">
              <TableHead className="px-4 py-3 text-sm font-bold text-gray-700 border-l border-gray-200 last:border-l-0 w-24 text-center">
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleVariants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColors.length + 1}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  لا توجد متغيرات مطابقة
                </TableCell>
              </TableRow>
            ) : (
              <>
                {visibleVariants.map((variant) => (
                  <TableRow key={variant.size} className="hover:bg-gray-50/50">
                    <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-800 border-l border-gray-200 last:border-l-0">
                      {variant.size}
                    </TableCell>
                    {visibleColors.map((color) => {
                      const stock = variant.stocks[color];
                      const statusConfig = stock
                        ? STOCK_STATUS_CONFIG[stock.status]
                        : null;

                      return (
                        <TableCell
                          key={color}
                          className="px-4 py-3 border-l border-gray-200 last:border-l-0"
                        >
                          {stock ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-default">
                                  <StockBadge stock={stock} />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="flex flex-col gap-1 text-right">
                                  <span className="font-bold">{product.name}</span>
                                  <span>المقاس: {variant.size}</span>
                                  <span>اللون: {color}</span>
                                  <span>الكمية: {stock.quantity}</span>
                                  <span>الحالة: {statusConfig?.label}</span>
                                </div>
                                <TooltipArrow />
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="block text-center text-sm text-gray-300">
                              -
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 border-t-2 border-gray-200">
                  <TableCell className="px-4 py-3 text-center text-xs font-bold text-gray-600 border-l border-gray-200 last:border-l-0">
                    عدد الإجمالي لكل متغير
                  </TableCell>
                  {columnTotals.map((total, idx) => (
                    <TableCell
                      key={visibleColors[idx]}
                      className="px-4 py-3 text-center text-sm font-bold text-gray-800 border-l border-gray-200 last:border-l-0"
                    >
                      {total}
                    </TableCell>
                  ))}
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
