import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

export type ExportCell = string | number | null;

export interface ExportFilterEntry {
  label: string;
  value: string;
}

export interface ExportRowsInput {
  rows: Array<Record<string, ExportCell>>;
  columns: string[];
  fileName: string;
  filterSummary: ExportFilterEntry[];
}

export function exportRowsToExcel({ rows, columns, fileName, filterSummary }: ExportRowsInput): boolean {
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
    return true;
  } catch {
    toast.error('تعذر تصدير الملف');
    return false;
  }
}
