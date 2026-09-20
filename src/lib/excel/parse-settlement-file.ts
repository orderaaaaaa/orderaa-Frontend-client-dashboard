import * as XLSX from 'xlsx';
import type { SettlementRow } from '@/lib/api/settlement';

export function parseSettlementFile(file: File): Promise<SettlementRow[]> {
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

        const validStatuses = ['COLLECTED', 'RETURNED_SETTLED'] as const;
        const result: SettlementRow[] = [];

        for (const row of rows) {
          const orderCode = String(row.orderCode ?? '').trim();
          const shippingCompanyCode = String(row.shippingCompanyCode ?? '').trim();

          if (!orderCode && !shippingCompanyCode) continue;

          const rawAmount = row.settlementAmount;
          const settlementAmount =
            typeof rawAmount === 'number' ? rawAmount : Number(rawAmount);
          if (Number.isNaN(settlementAmount)) continue;

          const targetStatus = String(row.targetStatus ?? '').trim() as
            | (typeof validStatuses)[number]
            | '';
          if (!validStatuses.includes(targetStatus as (typeof validStatuses)[number])) continue;

          result.push({
            orderCode: orderCode || undefined,
            shippingCompanyCode: shippingCompanyCode || undefined,
            settlementAmount,
            targetStatus: targetStatus as (typeof validStatuses)[number],
          });
        }

        if (result.length === 0) {
          reject(new Error('لا توجد صفوف صالحة في الملف'));
          return;
        }

        resolve(result);
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
