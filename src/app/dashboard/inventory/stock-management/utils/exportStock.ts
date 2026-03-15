import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import type { StockProduct } from '../types';
import { STOCK_STATUS_CONFIG } from '../constants';

export function exportStockToExcel(products: StockProduct[]) {
  if (products.length === 0) {
    toast.error('لا توجد منتجات لتصديرها');
    return;
  }

  const workbook = XLSX.utils.book_new();

  products.forEach((product) => {
    const rows = product.variants.map((variant) => {
      const row: Record<string, string | number> = { 'المقاس': variant.size };
      product.colors.forEach((color) => {
        const stock = variant.stocks[color];
        row[color] = stock ? stock.quantity : 0;
      });
      return row;
    });

    const totalsRow: Record<string, string | number> = { 'المقاس': 'الإجمالي' };
    product.colors.forEach((color) => {
      totalsRow[color] = product.variants.reduce(
        (sum, v) => sum + (v.stocks[color]?.quantity ?? 0),
        0
      );
    });
    rows.push(totalsRow);

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 12 },
      ...product.colors.map(() => ({ wch: 14 })),
    ];

    const sheetName = product.name.slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `تقرير_المخزن_${timestamp}.xlsx`);
  toast.success('تم تصدير التقرير بنجاح');
}

export async function exportStockToPDF(products: StockProduct[]) {
  if (products.length === 0) {
    toast.error('لا توجد منتجات لتصديرها');
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:900px;height:1200px;border:none;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  const tablesHtml = products
    .map((product) => {
      const headerCells = ['المقاس', ...product.colors]
        .map((h) => `<th>${h}</th>`)
        .join('');

      const bodyRows = product.variants
        .map((variant, i) => {
          const cells = product.colors
            .map((color) => {
              const stock = variant.stocks[color];
              if (!stock) return '<td>-</td>';
              const config = STOCK_STATUS_CONFIG[stock.status];
              return `<td>${stock.quantity} <span class="badge" style="color:${stock.status === 'out_of_stock' ? '#6b7280' : stock.status === 'high' ? '#047857' : stock.status === 'medium' ? '#b45309' : '#b91c1c'}">(${config.label})</span></td>`;
            })
            .join('');
          return `<tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}"><td class="size-cell">${variant.size}</td>${cells}</tr>`;
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
            <div class="product-name">${product.name}</div>
            <div class="product-sku">SKU: ${product.sku}</div>
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

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Cairo', Tahoma, Arial, sans-serif;
          direction: rtl;
          background: #fff;
          color: #1f2937;
          padding: 40px;
          width: 800px;
        }
        .header { text-align: center; margin-bottom: 32px; }
        .header h1 { font-size: 22px; font-weight: bold; }
        .header p { font-size: 12px; color: #9ca3af; margin-top: 4px; }
        .product-section { margin-bottom: 32px; }
        .product-header { margin-bottom: 12px; }
        .product-name { font-size: 16px; font-weight: bold; }
        .product-sku { font-size: 11px; color: #9ca3af; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead tr { background: #5B21B6; color: #fff; }
        th, td { padding: 8px 10px; text-align: center; }
        .size-cell { font-weight: 600; }
        .row-even { background: #fff; }
        .row-odd { background: #f9fafb; }
        tbody tr { border-bottom: 1px solid #e5e7eb; }
        .total-row { background: #f3f4f6; border-top: 2px solid #d1d5db; }
        .total-cell { font-weight: bold; }
        .badge { font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>تقرير المخزن</h1>
        <p>${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      ${tablesHtml}
    </body>
    </html>
  `);
  iframeDoc.close();

  await new Promise((resolve) => {
    iframe.onload = resolve;
    setTimeout(resolve, 1500);
  });

  const canvas = await html2canvas(iframeDoc.body, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  document.body.removeChild(iframe);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 190;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pageHeight = 277;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let position = 10;
  let remainingHeight = imgHeight;

  if (imgHeight <= pageHeight) {
    doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  } else {
    while (remainingHeight > 0) {
      doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
      if (remainingHeight > 0) {
        doc.addPage();
        position = -(imgHeight - remainingHeight) + 10;
      }
    }
  }

  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`تقرير_المخزن_${timestamp}.pdf`);
  toast.success('تم تصدير التقرير بنجاح');
}
