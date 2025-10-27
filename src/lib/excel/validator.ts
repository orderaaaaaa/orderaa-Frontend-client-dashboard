import {
  AppFormatRow,
  EasyOrderFormatRow,
  OrderValidationResult,
  ValidationError,
} from '@/types/excel-upload';
import { isEmpty, isValidPhoneNumber, isValidNumber } from './parser';

export function validateAppFormatRow(
  row: AppFormatRow,
  rowIndex: number
): OrderValidationResult {
  const errors: ValidationError[] = [];

  if (isEmpty(row.FullName)) {
    errors.push({
      field: 'FullName',
      message: 'بدون اسم العنوان غير مكتمل',
    });
  }

  if (isEmpty(row.Phone)) {
    errors.push({
      field: 'Phone',
      message: 'نحتاج إلى بعض المساعدة، يرجى توضيح ما يلي: رقم الهاتف مفقود',
    });
  } else if (!isValidPhoneNumber(row.Phone)) {
    errors.push({
      field: 'Phone',
      message: 'رقم الهاتف غير صحيح',
    });
  }

  if (isEmpty(row.City)) {
    errors.push({
      field: 'City',
      message: 'المحافظة مطلوبة',
    });
  }

  if (isEmpty(row.Address)) {
    errors.push({
      field: 'Address',
      message: 'بدون العنوان غير مكتمل',
    });
  }

  if (isEmpty(row['Shipping Cost'])) {
    errors.push({
      field: 'Shipping Cost',
      message: 'لم يمكن تحديد السعر - تكلفة الشحن مطلوبة',
    });
  } else if (!isValidNumber(row['Shipping Cost'])) {
    errors.push({
      field: 'Shipping Cost',
      message: 'لم يمكن تحديد السعر - تكلفة الشحن غير صحيحة',
    });
  }

  if (isEmpty(row['Product Name 1'])) {
    errors.push({
      field: 'Product Name 1',
      message: 'يجب إضافة منتج واحد على الأقل',
    });
  }

  if (!isEmpty(row['Phone 2']) && !isValidPhoneNumber(row['Phone 2'])) {
    errors.push({
      field: 'Phone 2',
      message: 'رقم الهاتف الثاني غير صحيح',
    });
  }

  return {
    rowIndex,
    isValid: errors.length === 0,
    errors,
    data: row,
  };
}

export function validateEasyOrderFormatRow(
  row: EasyOrderFormatRow,
  rowIndex: number
): OrderValidationResult {
  const errors: ValidationError[] = [];

  if (isEmpty(row.FullName)) {
    errors.push({
      field: 'FullName',
      message: 'بدون اسم العنوان غير مكتمل',
    });
  }

  if (isEmpty(row.Phone)) {
    errors.push({
      field: 'Phone',
      message: 'نحتاج إلى بعض المساعدة، يرجى توضيح ما يلي: رقم الهاتف مفقود',
    });
  } else if (!isValidPhoneNumber(row.Phone)) {
    errors.push({
      field: 'Phone',
      message: 'رقم الهاتف غير صحيح',
    });
  }

  if (isEmpty(row.Address)) {
    errors.push({
      field: 'Address',
      message: 'بدون العنوان غير مكتمل',
    });
  }

  if (isEmpty(row['Shipping Cost'])) {
    errors.push({
      field: 'Shipping Cost',
      message: 'لم يمكن تحديد السعر - تكلفة الشحن مطلوبة',
    });
  } else if (!isValidNumber(row['Shipping Cost'])) {
    errors.push({
      field: 'Shipping Cost',
      message: 'لم يمكن تحديد السعر - تكلفة الشحن غير صحيحة',
    });
  }

  if (isEmpty(row['Product Name'])) {
    errors.push({
      field: 'Product Name',
      message: 'يجب إضافة منتج واحد على الأقل',
    });
  }

  if (!isEmpty(row['Total Cost']) && !isValidNumber(row['Total Cost'])) {
    errors.push({
      field: 'Total Cost',
      message: 'التكلفة الإجمالية غير صحيحة',
    });
  }

  if (!isEmpty(row['Product Cost']) && !isValidNumber(row['Product Cost'])) {
    errors.push({
      field: 'Product Cost',
      message: 'تكلفة المنتج غير صحيحة',
    });
  }

  if (!isEmpty(row['Item Price']) && !isValidNumber(row['Item Price'])) {
    errors.push({
      field: 'Item Price',
      message: 'سعر المنتج غير صحيح',
    });
  }

  if (!isEmpty(row.Quantity) && !isValidNumber(row.Quantity)) {
    errors.push({
      field: 'Quantity',
      message: 'الكمية غير صحيحة',
    });
  }

  if (!isEmpty(row['Alt Phone']) && !isValidPhoneNumber(row['Alt Phone'])) {
    errors.push({
      field: 'Alt Phone',
      message: 'رقم الهاتف البديل غير صحيح',
    });
  }

  return {
    rowIndex,
    isValid: errors.length === 0,
    errors,
    data: row,
  };
}
