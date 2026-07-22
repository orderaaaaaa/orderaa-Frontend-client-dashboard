import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SupplierInvoice } from '../types';
import { INVOICE_TYPE_LABEL } from '../../../constants';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';

function sanitizeHtml(value: unknown): string {
  const str = value == null ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function exportSupplierInvoicesToExcel(
  invoices: SupplierInvoice[],
  supplierName: string,
) {
  if (invoices.length === 0) return;

  const excelData = invoices.map((inv) => ({
    'رقم الفاتورة': inv.code,
    'انشأ بواسطة': inv.createdByEmployee ? getDepartmentLabel(inv.createdByEmployee.department) : 'غير محدد',
    'عدد الاصناف': inv.products.length,
    'التاريخ': formatDate(inv.createdAt),
    'المبلغ': inv.totalAmount,
    'نوع الفاتورة': INVOICE_TYPE_LABEL[inv.type] ?? inv.type,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'فواتير المورد');

  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `فواتير_${supplierName}_${timestamp}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportInvoiceToExcel(invoice: SupplierInvoice) {
  const hasPackageFields = invoice.products.some(
    (item) => item.packageCount != null || item.piecesPerPackage != null,
  );

  const excelData = invoice.products.map((item) => ({
    'اسم الصنف': item.product.name,
    'إجمالي عدد القطع': item.quantity,
    ...(hasPackageFields ? { 'عدد الطرود': item.packageCount ?? '' } : {}),
    ...(hasPackageFields ? { 'عدد القطع في الطرد': item.piecesPerPackage ?? '' } : {}),
    'السعر': item.price,
    'الاجمالي': item.quantity * item.price,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = hasPackageFields
    ? [
        { wch: 30 },
        { wch: 14 },
        { wch: 12 },
        { wch: 14 },
        { wch: 12 },
        { wch: 14 },
      ]
    : [
        { wch: 30 },
        { wch: 14 },
        { wch: 12 },
        { wch: 14 },
      ];

  const totalQuantity = invoice.products.reduce((s, i) => s + i.quantity, 0);
  const grandTotal = invoice.products.reduce((s, i) => s + i.quantity * i.price, 0);
  const lastRow = excelData.length + 2;

  const totalsHeaders = hasPackageFields
    ? ['إجمالي عدد القطع', totalQuantity, '', '', '', '']
    : ['إجمالي عدد القطع', totalQuantity, '', ''];

  const totalsGrand = hasPackageFields
    ? ['المبلغ الاجمالي', '', '', '', '', grandTotal]
    : ['المبلغ الاجمالي', '', '', grandTotal];

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [totalsHeaders, totalsGrand],
    { origin: `A${lastRow}` },
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'فاتورة');

  const fileName = `فاتورة_${invoice.code}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export async function exportInvoiceToPDF(invoice: SupplierInvoice) {
  const totalQuantity = invoice.products.reduce((s, i) => s + i.quantity, 0);
  const grandTotal = invoice.products.reduce((s, i) => s + i.quantity * i.price, 0);
  const hasPackageFields = invoice.products.some(
    (item) => item.packageCount != null || item.piecesPerPackage != null,
  );

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:1200px;border:none;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

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
          width: 700px;
        }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { font-size: 22px; font-weight: bold; }
        .info-row { display: flex; gap: 12px; margin-bottom: 24px; }
        .info-card { flex: 1; background: #f9fafb; border-radius: 12px; padding: 16px; }
        .info-label { font-size: 11px; color: #9ca3af; }
        .info-value { font-size: 14px; font-weight: bold; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        thead tr { background: #5B21B6; color: #fff; }
        th, td { padding: 10px 8px; }
        th:first-child, td:first-child { text-align: right; }
        th:last-child, td:last-child { text-align: left; }
        th:nth-child(2), td:nth-child(2),
        th:nth-child(3), td:nth-child(3) { text-align: center; }
        .row-even { background: #fff; }
        .row-odd { background: #f9fafb; }
        tbody tr { border-bottom: 1px solid #e5e7eb; }
        .totals { border-top: 2px solid #e5e7eb; margin-top: 20px; padding-top: 16px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>فاتورة رقم ${sanitizeHtml(invoice.code)}</h1>
      </div>

      <div class="info-row">
        <div class="info-card">
          <div class="info-label">موظف المشتريات</div>
          <div class="info-value">${sanitizeHtml(invoice.createdByEmployee ? getDepartmentLabel(invoice.createdByEmployee.department) : 'غير محدد')}</div>
        </div>
        <div class="info-card">
          <div class="info-label">تاريخ الانشاء</div>
          <div class="info-value">${sanitizeHtml(formatDate(invoice.createdAt))}</div>
        </div>
      </div>

      <div class="section-title">الاصناف المشتريات</div>

      <table>
        <thead>
          <tr>
            <th>اسم الصنف</th>
            <th>إجمالي عدد القطع</th>
            ${hasPackageFields ? '<th>عدد الطرود</th><th>عدد القطع في الطرد</th>' : ''}
            <th>السعر</th>
            <th>الاجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.products
            .map(
              (item, i) => `
            <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
              <td>${sanitizeHtml(item.product.name)}</td>
              <td>${sanitizeHtml(item.quantity)}</td>
              ${hasPackageFields ? `<td>${sanitizeHtml(item.packageCount ?? '')}</td><td>${sanitizeHtml(item.piecesPerPackage ?? '')}</td>` : ''}
              <td>${sanitizeHtml(item.price.toFixed(1))}</td>
              <td style="font-weight:600;">${sanitizeHtml((item.quantity * item.price).toLocaleString())}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>إجمالي عدد القطع</span>
          <span>${sanitizeHtml(totalQuantity)}</span>
        </div>
        <div class="total-row">
          <span>المبلغ الاجمالي</span>
          <span>${sanitizeHtml(grandTotal.toFixed(2))}</span>
        </div>
      </div>
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

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  doc.save(`فاتورة_${invoice.code}.pdf`);
}
