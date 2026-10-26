import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

export type SalesExportCell = string | number | null;

export interface SalesExportFilterEntry {
  label: string;
  value: string;
}

export interface ExportSalesRowsInput {
  rows: Array<Record<string, SalesExportCell>>;
  columns: string[];
  fileName: string;
  filterSummary: SalesExportFilterEntry[];
}

export function exportSalesRowsToExcel({
  rows,
  columns,
  fileName,
  filterSummary,
}: ExportSalesRowsInput): void {
  try {
    const workbook = XLSX.utils.book_new();
    const rowsSheet = XLSX.utils.json_to_sheet(rows, { header: columns });
    XLSX.utils.book_append_sheet(workbook, rowsSheet, 'البيانات');

    const filterSheet = XLSX.utils.aoa_to_sheet([
      ['البند', 'القيمة'],
      ...filterSummary.map((entry) => [entry.label, entry.value]),
    ]);
    XLSX.utils.book_append_sheet(workbook, filterSheet, 'الفلتر');

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch {
    toast.error('تعذر تصدير الملف');
  }
}
