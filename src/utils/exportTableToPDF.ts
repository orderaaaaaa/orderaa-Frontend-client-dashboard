import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

interface ExportTableToPDFOptions {
  title: string;
  headers: string[];
  rows: string[][];
  fileName: string;
}

export async function exportTableToPDF({
  title,
  headers,
  rows,
  fileName,
}: ExportTableToPDFOptions) {
  if (rows.length === 0) {
    toast.error('لا توجد بيانات لتصديرها');
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;height:1200px;border:none;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    toast.error('فشل في إنشاء ملف PDF');
    return;
  }

  const headerCells = headers.map((h) => `<th>${h}</th>`).join('');
  const bodyRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
    .join('');

  iframeDoc.open();
  iframeDoc.write(`
    <html dir="rtl">
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          body { font-family: 'Cairo', sans-serif; padding: 24px; background: white; }
          h2 { text-align: center; color: #1f1f1f; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f1eefa; color: #6b21a8; padding: 10px 8px; font-weight: 700; font-size: 14px; border: 1px solid #e5e7eb; }
          td { padding: 10px 8px; font-size: 13px; text-align: center; border: 1px solid #e5e7eb; }
          tr:nth-child(even) { background: #fafafa; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <table>
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>
  `);
  iframeDoc.close();

  await new Promise((r) => setTimeout(r, 500));

  try {
    const canvas = await html2canvas(iframeDoc.body, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yOffset = 10;
    let remainingHeight = imgHeight;

    while (remainingHeight > 0) {
      const sliceHeight = Math.min(remainingHeight, pageHeight - 20);
      pdf.addImage(imgData, 'PNG', 10, yOffset - (imgHeight - remainingHeight), imgWidth, imgHeight);

      remainingHeight -= sliceHeight;
      if (remainingHeight > 0) {
        pdf.addPage();
        yOffset = 10;
      }
    }

    const timestamp = new Date().toISOString().split('T')[0];
    pdf.save(`${fileName}_${timestamp}.pdf`);
    toast.success('تم تصدير التقرير بنجاح');
  } catch {
    toast.error('فشل في إنشاء ملف PDF');
  } finally {
    document.body.removeChild(iframe);
  }
}
