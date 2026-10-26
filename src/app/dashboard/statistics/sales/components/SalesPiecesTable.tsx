'use client';

import { Fragment, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SalesExportCell } from '@/lib/excel/export-sales-statistics';
import { cn } from '@/lib/utils';
import { formatCount, formatMoney } from '@/utils/formatMoney';
import type { SalesPieceProduct } from '../types';

interface SalesPiecesTableProps {
  withCost: boolean;
  products: SalesPieceProduct[];
}

const PIECE_TABLE_HEADERS = {
  name: 'المنتج / المتغير',
  piecesSold: 'عدد القطع',
  avgUnitCost: 'متوسط تكلفة القطعة',
  soldPiecesCost: 'إجمالي التكلفة',
  uncostedPieces: 'قطع بدون تكلفة',
} as const;

const STICKY_HEADER = 'sticky top-0 z-10 bg-card/95 backdrop-blur text-muted-foreground text-xs';

export function buildSalesPieceExport(
  products: SalesPieceProduct[],
  withCost: boolean,
): { columns: string[]; rows: Array<Record<string, SalesExportCell>> } {
  const columns = withCost
    ? [
        PIECE_TABLE_HEADERS.name,
        PIECE_TABLE_HEADERS.piecesSold,
        PIECE_TABLE_HEADERS.avgUnitCost,
        PIECE_TABLE_HEADERS.soldPiecesCost,
        PIECE_TABLE_HEADERS.uncostedPieces,
      ]
    : [PIECE_TABLE_HEADERS.name, PIECE_TABLE_HEADERS.piecesSold];

  const rows: Array<Record<string, SalesExportCell>> = [];
  products.forEach((product) => {
    rows.push({
      [PIECE_TABLE_HEADERS.name]: product.name,
      [PIECE_TABLE_HEADERS.piecesSold]: product.piecesSold,
      [PIECE_TABLE_HEADERS.avgUnitCost]: null,
      [PIECE_TABLE_HEADERS.soldPiecesCost]: Number(product.soldPiecesCost),
      [PIECE_TABLE_HEADERS.uncostedPieces]: product.uncostedPieces,
    });
    product.variants.forEach((variant) => {
      rows.push({
        [PIECE_TABLE_HEADERS.name]: `${product.name} / ${variant.label}`,
        [PIECE_TABLE_HEADERS.piecesSold]: variant.piecesSold,
        [PIECE_TABLE_HEADERS.avgUnitCost]:
          variant.avgUnitCost === null ? null : Number(variant.avgUnitCost),
        [PIECE_TABLE_HEADERS.soldPiecesCost]: Number(variant.soldPiecesCost),
        [PIECE_TABLE_HEADERS.uncostedPieces]: variant.uncostedPieces,
      });
    });
  });

  return { columns, rows };
}

export function SalesPiecesTable({ withCost, products }: SalesPiecesTableProps) {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<number>>(() => new Set<number>());

  const toggleProduct = (productId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl">
      <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
        <table className="w-full caption-bottom text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-0">
              <TableHead scope="col" className={cn('whitespace-nowrap', STICKY_HEADER)}>
                {PIECE_TABLE_HEADERS.name}
              </TableHead>
              <TableHead scope="col" className={cn('whitespace-nowrap text-end', STICKY_HEADER)}>
                {PIECE_TABLE_HEADERS.piecesSold}
              </TableHead>
              {withCost && (
                <>
                  <TableHead scope="col" className={cn('whitespace-nowrap text-end', STICKY_HEADER)}>
                    {PIECE_TABLE_HEADERS.avgUnitCost}
                  </TableHead>
                  <TableHead scope="col" className={cn('whitespace-nowrap text-end', STICKY_HEADER)}>
                    {PIECE_TABLE_HEADERS.soldPiecesCost}
                  </TableHead>
                  <TableHead scope="col" className={cn('whitespace-nowrap text-end', STICKY_HEADER)}>
                    {PIECE_TABLE_HEADERS.uncostedPieces}
                  </TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isExpanded = expandedIds.has(product.productId);
              return (
                <Fragment key={product.productId}>
                  <TableRow className="hover:bg-accent/50">
                    <TableCell className="whitespace-nowrap">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleProduct(product.productId)}
                        className="inline-flex items-center gap-2 font-medium"
                      >
                        <ChevronDown
                          className={cn('size-4 transition-transform', isExpanded && 'rotate-180')}
                          aria-hidden="true"
                        />
                        {product.name}
                      </button>
                    </TableCell>
                    <TableCell className="tabular-nums text-end">
                      {formatCount(product.piecesSold)}
                    </TableCell>
                    {withCost && (
                      <>
                        <TableCell className="tabular-nums text-end">—</TableCell>
                        <TableCell className="tabular-nums text-end">
                          {formatMoney(product.soldPiecesCost)}
                        </TableCell>
                        <TableCell className="tabular-nums text-end">
                          {formatCount(product.uncostedPieces)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  {isExpanded &&
                    product.variants.map((variant) => (
                      <TableRow key={variant.variantId} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell className="whitespace-nowrap ps-8 text-muted-foreground">
                          {variant.label}
                        </TableCell>
                        <TableCell className="tabular-nums text-end">
                          {formatCount(variant.piecesSold)}
                        </TableCell>
                        {withCost && (
                          <>
                            <TableCell className="tabular-nums text-end">
                              {formatMoney(variant.avgUnitCost)}
                            </TableCell>
                            <TableCell className="tabular-nums text-end">
                              {formatMoney(variant.soldPiecesCost)}
                            </TableCell>
                            <TableCell className="tabular-nums text-end">
                              {formatCount(variant.uncostedPieces)}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                </Fragment>
              );
            })}
          </TableBody>
        </table>
      </div>
    </div>
  );
}
