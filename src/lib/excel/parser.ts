import * as XLSX from 'xlsx';
import {
  AppFormatRow,
  EasyOrderFormatRow,
  ExcelFormat,
  ParsedExcelData,
} from '@/types/excel-upload';

export function detectExcelFormat(headers: string[]): ExcelFormat {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

  const hasSallaColumns = 
    normalizedHeaders.some(h => h.includes('salla') || h.includes('سلة')) ||
    normalizedHeaders.includes('order id') ||
    normalizedHeaders.includes('order number') ||
    normalizedHeaders.includes('customer name') ||
    normalizedHeaders.includes('اسم العميل') ||
    normalizedHeaders.includes('رقم الطلب');

  const hasAppFormatColumns =
    normalizedHeaders.includes('product name 1') ||
    normalizedHeaders.includes('variant 1');

  const hasEasyOrderColumns =
    (normalizedHeaders.includes('total cost') ||
    normalizedHeaders.includes('product cost') ||
    normalizedHeaders.includes('sku') ||
    normalizedHeaders.includes('item price')) &&
    normalizedHeaders.includes('product name') &&
    !normalizedHeaders.includes('product name 1');

  const hasBasicOrderColumns =
    normalizedHeaders.includes('fullname') ||
    normalizedHeaders.includes('full name') ||
    normalizedHeaders.includes('customer name') ||
    normalizedHeaders.includes('اسم العميل') ||
    normalizedHeaders.includes('phone') ||
    normalizedHeaders.includes('هاتف') ||
    normalizedHeaders.includes('رقم الهاتف') ||
    normalizedHeaders.includes('city') ||
    normalizedHeaders.includes('مدينة') ||
    normalizedHeaders.includes('محافظة') ||
    normalizedHeaders.includes('address') ||
    normalizedHeaders.includes('عنوان') ||
    hasSallaColumns;

  if (!hasBasicOrderColumns) {
    throw new Error(
      `تنسيق الملف غير صحيح. الأعمدة الموجودة: ${headers.join(', ')}. يرجى استخدام أحد القوالب المتاحة (Orderaa أو EasyOrder) أو ملف Salla صحيح`
    );
  }

  if (hasSallaColumns) {
    return 'easyorder';
  }

  if (hasEasyOrderColumns) {
    return 'easyorder';
  } else if (hasAppFormatColumns) {
    return 'app';
  }

  return 'app';
}

export async function parseExcelFile(
  file: File
): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        
        if (!data) {
          reject(new Error('فشل في قراءة محتوى الملف'));
          return;
        }

        let workbook;
        try {
          workbook = XLSX.read(data, { type: 'binary' });
        } catch (binaryError) {
          try {
            workbook = XLSX.read(data, { type: 'array' });
          } catch (arrayError) {
            try {
              workbook = XLSX.read(data, { type: 'base64' });
            } catch (base64Error) {
              const errorMsg = binaryError instanceof Error ? binaryError.message : 'خطأ غير معروف';
              reject(new Error(`فشل في قراءة الملف. تفاصيل الخطأ: ${errorMsg}`));
              return;
            }
          }
        }

        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('الملف لا يحتوي على أي صفحات عمل'));
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          reject(new Error('فشل في قراءة صفحة العمل الأولى'));
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: '',
          blankrows: false,
        });

        if (jsonData.length === 0) {
          reject(new Error('الملف فارغ أو لا يحتوي على بيانات'));
          return;
        }

        const headers = Object.keys(jsonData[0] as object);

        const format = detectExcelFormat(headers);

        resolve({
          format,
          data: jsonData as (AppFormatRow | EasyOrderFormatRow)[],
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'خطأ غير معروف';
        reject(new Error(`فشل في قراءة الملف. تأكد من أن الملف بتنسيق Excel صحيح. تفاصيل: ${errorMsg}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('فشل في قراءة الملف'));
    };

    reader.readAsBinaryString(file);
  });
}

export function isEmpty(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (typeof value === 'string' && value.trim() === '')
  );
}

export function isValidPhoneNumber(phone: any): boolean {
  if (isEmpty(phone)) return false;
  
  const cleaned = String(phone).replace(/[\s-]/g, '');
  
  return /^(\+?20)?0?1[0-9]{9}$/.test(cleaned) || /^\d{10,15}$/.test(cleaned);
}

export function isValidNumber(value: any): boolean {
  if (isEmpty(value)) return false;
  const num = typeof value === 'number' ? value : parseFloat(value);
  return !isNaN(num) && num >= 0;
}
