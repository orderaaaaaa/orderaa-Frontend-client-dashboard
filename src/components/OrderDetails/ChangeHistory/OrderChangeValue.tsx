import { formatDate, formatDateTime } from '@/utils/format';
import React from 'react';
import {
  ORDER_PAYMENT_METHOD_LABELS,
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_SHIPPING_TYPE_LABELS,
  SETTLEMENT_RECORD_TYPE_LABELS,
  enumLabelOf,
} from '@/constants/orderFieldLabels';
import type {
  OrderChangeJsonValue,
  OrderChangeLineValue,
  OrderChangeRefValue,
  OrderChangeValueType,
} from '@/types/orderChangeHistory';

export const EMPTY_CHANGE_VALUE = '—';
const UNKNOWN_REF_LABEL = 'غير معروف';
const UNKNOWN_PRODUCT_LABEL = 'منتج غير معروف';

type JsonObject = { [key: string]: OrderChangeJsonValue };

const isJsonObject = (value: OrderChangeJsonValue): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isRefValue = (value: OrderChangeJsonValue): value is OrderChangeRefValue & JsonObject =>
  isJsonObject(value) &&
  typeof value.id === 'number' &&
  (value.label === null || typeof value.label === 'string');

export const isLineValue = (value: OrderChangeJsonValue): value is OrderChangeLineValue & JsonObject =>
  isJsonObject(value) &&
  typeof value.productId === 'number' &&
  typeof value.quantity === 'number' &&
  typeof value.price === 'number' &&
  isRefValue(value.variant ?? null);

const formatNumber = (value: OrderChangeJsonValue) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString('en-US') : String(value);
};

const formatChangeDate = (value: OrderChangeJsonValue, withTime: boolean) => {
  if (typeof value !== 'string') return String(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return withTime ? formatDateTime(date) : formatDate(date);
};

export const customVariantsText = (value: OrderChangeJsonValue) => {
  if (!Array.isArray(value)) return '';
  return value
    .filter(isJsonObject)
    .filter((item) => typeof item.label === 'string' && typeof item.value === 'string')
    .map((item) => `${item.label}: ${item.value}`)
    .join(' / ');
};

const jsonText = (value: OrderChangeJsonValue) => {
  if (Array.isArray(value) && value.length === 0) return EMPTY_CHANGE_VALUE;
  const variants = customVariantsText(value);
  if (variants) return variants;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return JSON.stringify(value);
};

export const lineValueText = (line: OrderChangeLineValue) => {
  const extras = [line.variant.label, customVariantsText(line.customVariants), line.sku ? `SKU ${line.sku}` : '']
    .filter(Boolean)
    .join(' - ');
  const name = line.productName ?? UNKNOWN_PRODUCT_LABEL;
  return `${name}${extras ? ` (${extras})` : ''} × ${line.quantity} بسعر ${formatNumber(line.price)}`;
};

export const formatChangeValue = (
  valueType: OrderChangeValueType,
  value: OrderChangeJsonValue,
  getStatusLabel: (status: string) => string
): string => {
  if (value === null || value === '') return EMPTY_CHANGE_VALUE;
  switch (valueType) {
    case 'NUMBER':
    case 'DECIMAL':
      return formatNumber(value);
    case 'BOOLEAN':
      return value === true ? 'نعم' : value === false ? 'لا' : String(value);
    case 'DATETIME':
      return formatChangeDate(value, true);
    case 'DATE':
      return formatChangeDate(value, false);
    case 'REF':
      return isRefValue(value) ? value.label ?? UNKNOWN_REF_LABEL : UNKNOWN_REF_LABEL;
    case 'STRING_LIST':
      return Array.isArray(value)
        ? value.length > 0
          ? value.map(String).join('، ')
          : EMPTY_CHANGE_VALUE
        : String(value);
    case 'LINE':
      return isLineValue(value) ? lineValueText(value) : jsonText(value);
    case 'ENUM_ORDER_STATUS':
      return typeof value === 'string' ? getStatusLabel(value) || value : String(value);
    case 'ENUM_PAYMENT_METHOD':
      return typeof value === 'string' ? enumLabelOf(ORDER_PAYMENT_METHOD_LABELS, value) : String(value);
    case 'ENUM_PAYMENT_STATUS':
      return typeof value === 'string' ? enumLabelOf(ORDER_PAYMENT_STATUS_LABELS, value) : String(value);
    case 'ENUM_SHIPPING_TYPE':
      return typeof value === 'string' ? enumLabelOf(ORDER_SHIPPING_TYPE_LABELS, value) : String(value);
    case 'ENUM_SETTLEMENT_RECORD_TYPE':
      return typeof value === 'string' ? enumLabelOf(SETTLEMENT_RECORD_TYPE_LABELS, value) : String(value);
    case 'JSON':
      return jsonText(value);
    default:
      return typeof value === 'string' ? value : jsonText(value);
  }
};

const LTR_VALUE_TYPES: ReadonlySet<OrderChangeValueType> = new Set(['STRING_LIST']);

export interface OrderChangeValueProps {
  valueType: OrderChangeValueType;
  value: OrderChangeJsonValue;
  getStatusLabel: (status: string) => string;
  className?: string;
}

export function OrderChangeValue({ valueType, value, getStatusLabel, className }: OrderChangeValueProps) {
  const text = formatChangeValue(valueType, value, getStatusLabel);
  const ltr = LTR_VALUE_TYPES.has(valueType) && text !== EMPTY_CHANGE_VALUE;
  return (
    <span className={className} dir={ltr ? 'ltr' : undefined}>
      {text}
    </span>
  );
}

export default OrderChangeValue;
