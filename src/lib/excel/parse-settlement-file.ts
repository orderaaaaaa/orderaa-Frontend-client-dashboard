import * as XLSX from 'xlsx';
import type { SettlementRow } from '@/lib/api/settlement';
import { resolveSettlementTarget } from '@/lib/excel/settlement-target-names';

export interface SettlementSheetError {
  sheetRow: number;
  value: string;
  message: string;
}

export interface ParsedSettlementSheet {
  rows: SettlementRow[];
  errors: SettlementSheetError[];
}

const FIRST_DATA_ROW = 2;

export function parseSettlementFile(file: File): Promise<ParsedSettlementSheet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('فشل في قراءة الملف'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('الملف لا يحتوي على أي صفحات عمل'));
          return;
        }

        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(
          workbook.Sheets[sheetName],
          { defval: '' },
        );

        if (rows.length === 0) {
          reject(new Error('الملف فارغ أو لا يحتوي على بيانات'));
          return;
        }

        const result: SettlementRow[] = [];
        const errors: SettlementSheetError[] = [];

        rows.forEach((row, index) => {
          const orderCode = String(row.orderCode ?? '').trim();
          const shippingCompanyCode = String(row.shippingCompanyCode ?? '').trim();

          if (!orderCode && !shippingCompanyCode) return;

          const rawAmount = row.settlementAmount;
          const settlementAmount =
            typeof rawAmount === 'number' ? rawAmount : Number(rawAmount);
          if (Number.isNaN(settlementAmount)) return;

          const rawStatus = String(row.targetStatus ?? '').trim();
          const targetStatus = resolveSettlementTarget(row.targetStatus);
          if (!targetStatus) {
            const rowNumber: unknown = Object.getOwnPropertyDescriptor(row, '__rowNum__')?.value;
            errors.push({
              sheetRow: typeof rowNumber === 'number' ? rowNumber + 1 : index + FIRST_DATA_ROW,
              value: rawStatus,
              message: rawStatus ? `الحالة «${rawStatus}» غير معروفة` : 'خانة الحالة فارغة',
            });
            return;
          }

          result.push({
            orderCode: orderCode || undefined,
            shippingCompanyCode: shippingCompanyCode || undefined,
            settlementAmount,
            targetStatus,
          });
        });

        if (result.length === 0 && errors.length === 0) {
          reject(new Error('لا توجد صفوف صالحة في الملف'));
          return;
        }

        resolve({ rows: result, errors });
      } catch (err) {
        reject(
          new Error(
            `فشل في قراءة الملف: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`,
          ),
        );
      }
    };
    reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
    reader.readAsBinaryString(file);
  });
}
