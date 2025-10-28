import {
  AppFormatRow,
  EasyOrderFormatRow,
  OrderValidationResult,
  ValidationError,
} from '@/types/excel-upload';
import { isEmpty, isValidPhoneNumber, isValidNumber } from './parser';

function getValueFromRow(row: any, possibleNames: string[]): any {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return undefined;
}

export function validateAppFormatRow(
  row: AppFormatRow,
  rowIndex: number
): OrderValidationResult {
  const errors: ValidationError[] = [];

  if (isEmpty(row.FullName)) {
    errors.push({
      field: 'FullName',
      message: 'اسم العميل مطلوب',
    });
  }

  if (isEmpty(row.Phone)) {
    errors.push({
      field: 'Phone',
      message: 'رقم الهاتف مطلوب',
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
      message: 'العنوان مطلوب',
    });
  }

  if (isEmpty(row['Shipping Cost'])) {
    errors.push({
      field: 'Shipping Cost',
      message: 'تكلفة الشحن مطلوبة',
    });
  } else if (!isValidNumber(row['Shipping Cost'])) {
    errors.push({
      field: 'Shipping Cost',
      message: 'تكلفة الشحن غير صحيحة',
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

  const fullName = getValueFromRow(row, [
    'FullName',
    'Full Name', 
    'Customer Name',
    'اسم العميل',
    'الاسم',
    'Name'
  ]);

  if (isEmpty(fullName)) {
    errors.push({
      field: 'FullName',
      message: 'اسم العميل مطلوب',
    });
  }

  const phone = getValueFromRow(row, [
    'Phone',
    'رقم الهاتف',
    'هاتف',
    'Mobile',
    'Phone Number',
    'Customer Phone'
  ]);

  if (isEmpty(phone)) {
    errors.push({
      field: 'Phone',
      message: 'رقم الهاتف مطلوب',
    });
  } else if (!isValidPhoneNumber(phone)) {
    errors.push({
      field: 'Phone',
      message: 'رقم الهاتف غير صحيح',
    });
  }

  const address = getValueFromRow(row, [
    'Address',
    'عنوان',
    'العنوان',
    'Customer Address',
    'Shipping Address'
  ]);

  if (isEmpty(address)) {
    errors.push({
      field: 'Address',
      message: 'العنوان مطلوب',
    });
  }

  const totalCost = getValueFromRow(row, [
    'Total Cost',
    'التكلفة الإجمالية',
    'Total',
    'Total Amount'
  ]);

  if (isEmpty(totalCost)) {
    errors.push({
      field: 'Total Cost',
      message: 'التكلفة الإجمالية مطلوبة',
    });
  } else if (!isValidNumber(totalCost)) {
    errors.push({
      field: 'Total Cost',
      message: 'التكلفة الإجمالية غير صحيحة',
    });
  }

  const variant = getValueFromRow(row, [
    'Variant',
    'المقاس',
    'اللون',
    'Product Variant',
    'Size',
    'Color'
  ]);

  if (isEmpty(variant)) {
    errors.push({
      field: 'Variant',
      message: 'المقاس/اللون مطلوب',
    });
  }

  const quantity = getValueFromRow(row, [
    'Quantity',
    'الكمية',
    'Qty',
    'Amount'
  ]);

  if (isEmpty(quantity)) {
    errors.push({
      field: 'Quantity',
      message: 'الكمية مطلوبة',
    });
  } else if (!isValidNumber(quantity)) {
    errors.push({
      field: 'Quantity',
      message: 'الكمية غير صحيحة',
    });
  }

  const sku = getValueFromRow(row, [
    'SKU',
    'Product Code',
    'Code',
    'كود المنتج'
  ]);

  if (isEmpty(sku)) {
    errors.push({
      field: 'SKU',
      message: 'كود المنتج (SKU) مطلوب',
    });
  }

  const shippingCost = getValueFromRow(row, [
    'Shipping Cost',
    'تكلفة الشحن',
    'Shipping',
    'Delivery Cost',
    'Shipping Fee'
  ]);

  if (!isEmpty(shippingCost) && !isValidNumber(shippingCost)) {
    errors.push({
      field: 'Shipping Cost',
      message: 'تكلفة الشحن غير صحيحة',
    });
  }

  if (!isEmpty(row['Product Cost']) && !isValidNumber(row['Product Cost'])) {
    errors.push({
      field: 'Product Cost',
      message: 'تكلفة المنتج غير صحيحة',
    });
  }

  if (!isEmpty(row['Coupon Discount']) && !isValidNumber(row['Coupon Discount'])) {
    errors.push({
      field: 'Coupon Discount',
      message: 'خصم الكوبون غير صحيح',
    });
  }

  if (!isEmpty(row['Item Price']) && !isValidNumber(row['Item Price'])) {
    errors.push({
      field: 'Item Price',
      message: 'سعر المنتج غير صحيح',
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
