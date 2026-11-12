import { exportRowsToExcel, type ExportCell, type ExportFilterEntry, type ExportRowsInput } from './export-rows';

export type SalesExportCell = ExportCell;

export type SalesExportFilterEntry = ExportFilterEntry;

export type ExportSalesRowsInput = ExportRowsInput;

export function exportSalesRowsToExcel(input: ExportSalesRowsInput): void {
  exportRowsToExcel(input);
}
