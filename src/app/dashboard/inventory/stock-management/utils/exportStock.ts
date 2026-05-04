import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import {
  fetchAllStockProducts,
  type StockFiltersDto,
} from '@/services/stock';
import type { StockProduct } from '../types';
import { STOCK_STATUS_CONFIG } from '../constants';
import { apiListToStockProducts } from './transformStock';

async function loadAllProducts(
  filters: Omit<StockFiltersDto, 'page' | 'limit'>
): Promise<StockProduct[]> {
  try {
    const apiList = await fetchAllStockProducts(filters);
    return apiListToStockProducts(apiList);
  } catch (err) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || 'تعذر تحميل المنتجات للتصدير';
    toast.error(message);
    return [];
  }
}

interface FlatStockRow {
  'اسم المنتج': string;
  SKU: string;
  المقاس: string;
  اللون: string;
  الكمية: number;
  الحالة: string;
}

function flattenProducts(products: StockProduct[]): FlatStockRow[] {
  const rows: FlatStockRow[] = [];
  for (const product of products) {
    for (const variant of product.variants) {
      for (const color of product.colors) {
        const stock = variant.stocks[color];
        if (!stock) continue;
        rows.push({
          'اسم المنتج': product.name,
          SKU: product.sku,
          المقاس: variant.size,
          اللون: color,
          الكمية: stock.quantity,
          الحالة: STOCK_STATUS_CONFIG[stock.status].label,
        });
      }
    }
  }
  return rows;
}

export async function exportStockToExcel(
  filters: Omit<StockFiltersDto, 'page' | 'limit'>
) {
  const products = await loadAllProducts(filters);
  if (products.length === 0) {
    toast.error('لا توجد منتجات لتصديرها');
    return;
  }

  const rows = flattenProducts(products);
  if (rows.length === 0) {
    toast.error('لا توجد بيانات لتصديرها');
    return;
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['اسم المنتج', 'SKU', 'المقاس', 'اللون', 'الكمية', 'الحالة'],
  });

  worksheet['!cols'] = [
    { wch: 32 },
    { wch: 18 },
    { wch: 10 },
    { wch: 16 },
    { wch: 10 },
    { wch: 12 },
  ];

  if (!worksheet['!views']) worksheet['!views'] = [{}];
  worksheet['!views'][0] = { ...worksheet['!views'][0], RTL: true };

  XLSX.utils.book_append_sheet(workbook, worksheet, 'المخزن');

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `تقرير_المخزن_${timestamp}.xlsx`);
  toast.success('تم تصدير التقرير بنجاح');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildProductsHtml(products: StockProduct[]): string {
  return products
    .map((product) => {
      const headerCells = ['المقاس', ...product.colors]
        .map((h) => `<th>${escapeHtml(h)}</th>`)
        .join('');

      const bodyRows = product.variants
        .map((variant, i) => {
          const cells = product.colors
            .map((color) => {
              const stock = variant.stocks[color];
              if (!stock) return '<td>-</td>';
              const config = STOCK_STATUS_CONFIG[stock.status];
              const badgeColor =
                stock.status === 'out_of_stock'
                  ? '#6b7280'
                  : stock.status === 'high'
                    ? '#047857'
                    : stock.status === 'medium'
                      ? '#b45309'
                      : '#b91c1c';
              return `<td>${stock.quantity} <span class="badge" style="color:${badgeColor}">(${escapeHtml(config.label)})</span></td>`;
            })
            .join('');
          return `<tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}"><td class="size-cell">${escapeHtml(variant.size)}</td>${cells}</tr>`;
        })
        .join('');

      const totalCells = product.colors
        .map((color) => {
          const total = product.variants.reduce(
            (sum, v) => sum + (v.stocks[color]?.quantity ?? 0),
            0
          );
          return `<td class="total-cell">${total}</td>`;
        })
        .join('');

      return `
        <div class="product-section">
          <div class="product-header">
            <div class="product-name">${escapeHtml(product.name)}</div>
            <div class="product-sku">SKU: ${escapeHtml(product.sku)}</div>
          </div>
          <table>
            <thead><tr>${headerCells}</tr></thead>
            <tbody>
              ${bodyRows}
              <tr class="total-row"><td class="size-cell">الإجمالي</td>${totalCells}</tr>
            </tbody>
          </table>
        </div>
      `;
    })
    .join('');
}

const PDF_REPORT_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    background: #ffffff;
    color: #1f2937;
  }
  body {
    font-family: Tahoma, Arial, sans-serif;
    direction: rtl;
    padding: 40px;
    width: 800px;
  }
  .header { text-align: center; margin-bottom: 32px; }
  .header h1 { font-size: 22px; font-weight: bold; color: #111827; }
  .header p { font-size: 12px; color: #9ca3af; margin-top: 4px; }
  .product-section { margin-bottom: 32px; page-break-inside: avoid; }
  .product-header { margin-bottom: 12px; }
  .product-name { font-size: 16px; font-weight: bold; color: #111827; }
  .product-sku { font-size: 11px; color: #9ca3af; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; color: #1f2937; }
  thead tr { background: #5B21B6; color: #ffffff; }
  th, td { padding: 8px 10px; text-align: center; border: 1px solid #e5e7eb; }
  .size-cell { font-weight: 600; }
  .row-even { background: #ffffff; }
  .row-odd { background: #f9fafb; }
  .total-row { background: #f3f4f6; }
  .total-cell { font-weight: bold; }
  .badge { font-size: 10px; }
`;

function buildChunkHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>${PDF_REPORT_STYLES}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function buildHeaderHtml(): string {
  const today = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `<div class="header">
  <h1>تقرير المخزن</h1>
  <p>${escapeHtml(today)}</p>
</div>`;
}

async function waitTwoFrames(win: Window) {
  await new Promise<void>((resolve) => {
    win.requestAnimationFrame(() =>
      win.requestAnimationFrame(() => resolve())
    );
  });
}

const CHUNK_SIZE = 15;
const CAPTURE_SCALE = 2;
const SAFE_CANVAS_PIXELS = 14000;

async function loadIframeWithHtml(
  iframe: HTMLIFrameElement,
  html: string
): Promise<{ win: Window; doc: Document } | null> {
  await new Promise<void>((resolve) => {
    const onLoad = () => resolve();
    iframe.addEventListener('load', onLoad, { once: true });
    iframe.srcdoc = html;
    window.setTimeout(() => resolve(), 4000);
  });

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc?.body) return null;

  if (doc.fonts?.ready) {
    try {
      await doc.fonts.ready;
    } catch {
      // ignore font readiness failures
    }
  }
  await waitTwoFrames(win);
  return { win, doc };
}

async function captureChunkAsImage(
  iframe: HTMLIFrameElement,
  bodyHtml: string
): Promise<{ dataUrl: string; widthPx: number; heightPx: number } | null> {
  const loaded = await loadIframeWithHtml(iframe, buildChunkHtml(bodyHtml));
  if (!loaded) return null;

  const target = loaded.doc.body;
  const width = Math.max(target.scrollWidth, 800);
  const height = Math.max(target.scrollHeight, 1);

  let scale = CAPTURE_SCALE;
  if (Math.max(width, height) * scale > SAFE_CANVAS_PIXELS) {
    scale = Math.max(1, SAFE_CANVAS_PIXELS / Math.max(width, height));
  }

  const canvas = await html2canvas(target, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
    width,
    height,
    windowWidth: width,
    windowHeight: height,
  });

  if (!canvas.width || !canvas.height) return null;
  const dataUrl = canvas.toDataURL('image/png');
  if (!dataUrl.startsWith('data:image/png')) return null;
  return { dataUrl, widthPx: canvas.width, heightPx: canvas.height };
}

function chunkProducts<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export async function exportStockToPDF(
  filters: Omit<StockFiltersDto, 'page' | 'limit'>
) {
  const products = await loadAllProducts(filters);
  if (products.length === 0) {
    toast.error('لا توجد منتجات لتصديرها');
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    'position:fixed;left:-10000px;top:0;width:900px;height:1500px;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const cleanup = () => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  try {
    const chunks = chunkProducts(products, CHUNK_SIZE);
    const pageWidth = 190;
    const pageHeight = 277;
    const margin = 10;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let isFirstChunk = true;

    for (let i = 0; i < chunks.length; i++) {
      const isFirst = i === 0;
      const bodyHtml =
        (isFirst ? buildHeaderHtml() : '') + buildProductsHtml(chunks[i]);
      const captured = await captureChunkAsImage(iframe, bodyHtml);

      if (!captured) {
        toast.error('تعذر إنشاء صورة التقرير');
        return;
      }

      const imgWidth = pageWidth;
      const imgHeight = (captured.heightPx * imgWidth) / captured.widthPx;

      if (!isFirstChunk) doc.addPage();
      isFirstChunk = false;

      if (imgHeight <= pageHeight) {
        doc.addImage(
          captured.dataUrl,
          'PNG',
          margin,
          margin,
          imgWidth,
          imgHeight
        );
      } else {
        let position = margin;
        let remainingHeight = imgHeight;
        while (remainingHeight > 0) {
          doc.addImage(
            captured.dataUrl,
            'PNG',
            margin,
            position,
            imgWidth,
            imgHeight
          );
          remainingHeight -= pageHeight;
          if (remainingHeight > 0) {
            doc.addPage();
            position = -(imgHeight - remainingHeight) + margin;
          }
        }
      }
    }

    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`تقرير_المخزن_${timestamp}.pdf`);
    toast.success('تم تصدير التقرير بنجاح');
  } catch (err) {
    const message =
      (err as { message?: string })?.message || 'تعذر تصدير التقرير';
    toast.error(message);
  } finally {
    cleanup();
  }
}
