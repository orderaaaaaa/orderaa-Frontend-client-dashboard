'use client';

import { memo, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { LiaPrintSolid, LiaCheckDoubleSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { useReceiptStore } from '@/store/receiptStore';
import { MOCK_RECEIPT_PRODUCTS } from '../constants';
import { SelectedVariant } from '../types';

interface PrintStepProps {
  receiptId: string;
  productVariants: Record<number, SelectedVariant[]>;
}

interface PrintVariantRow extends Record<string, unknown> {
  id: string;
  variantName: string;
  color: string;
  size: string;
  image: string;
  quantity: number;
}

function generateRandomBarcode(): string {
  return Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
}

function generateBarcodeSVG(code: string): string {
  const bars: number[] = [];
  for (let i = 0; i < code.length; i++) {
    const digit = parseInt(code[i], 10);
    for (let j = 0; j < 4; j++) {
      bars.push((digit + j) % 2);
    }
  }

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100">';
  const barWidth = 200 / bars.length;
  bars.forEach((bar, i) => {
    if (bar === 1) {
      svg += `<rect x="${i * barWidth}" y="0" width="${barWidth}" height="80" fill="black"/>`;
    }
  });
  svg += `<text x="100" y="95" text-anchor="middle" font-size="12" font-family="monospace">${code}</text>`;
  svg += '</svg>';
  return svg;
}

function handlePrintVariant(variantName: string, quantity: number) {
  const pages = Array.from({ length: quantity }, () => {
    const code = generateRandomBarcode();
    const barcodeSvg = generateBarcodeSVG(code);
    return `
      <div class="page">
        <div class="content">
          <h2>${variantName}</h2>
          ${barcodeSvg}
          <p>${code}</p>
        </div>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @media print {
          .page { page-break-after: always; }
          .page:last-child { page-break-after: auto; }
        }
        .page {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        h2 { font-family: sans-serif; font-size: 24px; color: #333; }
        p { font-family: monospace; font-size: 18px; letter-spacing: 4px; color: #333; }
        svg { margin: 8px 0; }
      </style>
    </head>
    <body>${pages}</body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '0';
  iframe.style.height = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  iframe.onload = () => {
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
}

const PrintStep = memo(({ receiptId, productVariants }: PrintStepProps) => {
  const printedIds = useReceiptStore((s) => s.getReceiptState(receiptId).printedIds);
  const addPrintedId = useReceiptStore((s) => s.addPrintedId);

  const productsWithVariants = useMemo(() => {
    return MOCK_RECEIPT_PRODUCTS
      .filter((p) => productVariants[p.id]?.length > 0)
      .map((product) => ({
        product,
        variants: productVariants[product.id].map((v) => ({
          id: `${product.id}-${v.variantId ?? 0}-${v.color ?? ''}-${v.size ?? ''}`,
          variantName: `${v.variantName ?? ''} - ${v.color ?? ''} - ${v.size ?? ''}`,
          color: v.color ?? '',
          size: v.size ?? '',
          image: product.image,
          quantity: typeof v.quantity === 'number' ? v.quantity : 0,
        } satisfies PrintVariantRow)),
      }));
  }, [productVariants]);

  const handlePrint = useCallback((row: PrintVariantRow) => {
    handlePrintVariant(row.variantName, row.quantity);
    addPrintedId(receiptId, row.id);
  }, [receiptId, addPrintedId]);

  const columns: DataTableColumn<PrintVariantRow>[] = useMemo(
    () => [
      {
        key: 'image',
        header: 'صورة المنتج',
        className: 'w-20',
        render: (_value: unknown, row: PrintVariantRow) => (
          <div className="flex items-center justify-center">
            <Image
              src={row.image}
              alt={row.variantName}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          </div>
        ),
      },
      {
        key: 'variantName',
        header: 'اسم المتغير',
      },
      {
        key: 'quantity',
        header: 'الكمية',
        className: 'w-28',
        render: (_value: unknown, row: PrintVariantRow) => (
          <span className="text-sm font-semibold text-gray-800">{row.quantity}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-40',
        render: (_value: unknown, row: PrintVariantRow) => {
          const isPrinted = printedIds.includes(row.id);
          return (
            <div className="flex items-center justify-start gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary/80 w-8 h-8"
                onClick={() => handlePrint(row)}
              >
                <LiaPrintSolid className="w-5 h-5" />
              </Button>
              {isPrinted && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                  <LiaCheckDoubleSolid className="w-4 h-4" />
                  تم الطباعة
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [printedIds, handlePrint]
  );

  const totalItems = useMemo(
    () =>
      productsWithVariants.reduce(
        (sum, p) => sum + p.variants.reduce((s, v) => s + (typeof v.quantity === 'number' ? v.quantity : 0), 0),
        0
      ),
    [productsWithVariants]
  );

  if (productsWithVariants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <LiaPrintSolid className="w-16 h-16 text-gray-300" />
        <p className="text-lg font-semibold text-gray-400">لا توجد متغيرات للطباعة</p>
        <p className="text-sm text-gray-400">يرجى إضافة متغيرات للمنتجات أولاً</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-gray-800">مرحلة الطباعة</h2>
        <p className="text-sm text-gray-500">
          اضغط على أيقونة الطباعة لطباعة المتغير
        </p>
      </div>

      {productsWithVariants.map(({ product, variants }) => (
        <div key={product.id} className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-gray-800">{product.name}</h3>
          <DataTable
            columns={columns}
            data={variants}
            keyField="id"
            emptyMessage="لا توجد متغيرات"
          />
          <div className="flex justify-end px-4">
            <p className="text-sm font-bold text-gray-800">
               إجمالي العدد: {variants.reduce((s, v) => s + (typeof v.quantity === 'number' ? v.quantity : 0), 0)}
            </p>
          </div>
        </div>
      ))}

      <div className="flex flex-row items-center justify-between px-4 pt-2 border-t border-gray-200">
        <p className="text-base font-bold text-gray-800">
          إجمالي المنتجات {productsWithVariants.length}
        </p>
        <p className="text-base font-bold text-gray-800">
          إجمالي عدد القطع {totalItems} قطعة
        </p>
      </div>
    </div>
  );
});

PrintStep.displayName = 'PrintStep';

export default PrintStep;
