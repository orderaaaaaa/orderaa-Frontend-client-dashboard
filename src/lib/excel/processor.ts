import {
  AppFormatRow,
  EasyOrderFormatRow,
  UploadResult,
  OrderValidationResult,
} from '@/types/excel-upload';
import { parseExcelFile } from './parser';
import {
  validateAppFormatRow,
  validateEasyOrderFormatRow,
} from './validator';

export async function processExcelFile(file: File): Promise<UploadResult> {
  try {
    const parsedData = await parseExcelFile(file);
    const { format, data } = parsedData;

    const validationResults: OrderValidationResult[] = data.map((row, index) => {
      const rowIndex = index + 1;

      if (format === 'app') {
        return validateAppFormatRow(row as AppFormatRow, rowIndex);
      } else {
        return validateEasyOrderFormatRow(row as EasyOrderFormatRow, rowIndex);
      }
    });

    const validOrders = validationResults.filter((result) => result.isValid);
    const invalidOrders = validationResults.filter((result) => !result.isValid);

    return {
      totalRows: data.length,
      successCount: validOrders.length,
      errorCount: invalidOrders.length,
      validOrders,
      invalidOrders,
      detectedFormat: format,
    };
  } catch (error) {
    throw error;
  }
}
