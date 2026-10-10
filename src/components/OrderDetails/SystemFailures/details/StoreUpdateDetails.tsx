import React from 'react';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { ORDER_PAYMENT_STATUS_LABELS, orderFieldLabelOf } from '@/constants/orderFieldLabels';
import { mapOrderProductToVariantInfo, type Order } from '@/types/orders';
import type {
  FailureMoney,
  StoreUpdateLine,
  StoreUpdateNotAppliedDetails,
  StoreUpdateNotAppliedReason,
} from '@/types/orderSystemFailures';
import { DetailField, DetailGrid, EMPTY_VALUE, formatDetailValue } from './DetailFields';
import { isFailureStockShortage } from './guards';
import { StockShortageDetails } from './StockShortageDetails';

type ComparisonRow = { key: string; label: string; update: unknown; current: unknown };

const paymentStatusLabelOf = (value: string | null | undefined) =>
  value
    ? (ORDER_PAYMENT_STATUS_LABELS as Record<string, string | undefined>)[value] ?? value
    : null;

const sameValue = (a: unknown, b: unknown) =>
  formatDetailValue(a) === formatDetailValue(b);

const moneyOf = (value: FailureMoney | number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

const customVariantsText = (value: unknown) => {
  if (!Array.isArray(value)) return '';
  return value
    .filter(
      (item): item is { label: string; value: string } =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { label?: unknown }).label === 'string' &&
        typeof (item as { value?: unknown }).value === 'string'
    )
    .map((item) => `${item.label}: ${item.value}`)
    .join(' / ');
};

const updateLineText = (line: StoreUpdateLine) => {
  const extras = [customVariantsText(line.customVariants), line.sku ? `SKU ${line.sku}` : '']
    .filter(Boolean)
    .join(' - ');
  const name = line.title ?? line.externalVariantId ?? 'منتج بدون اسم';
  return `${name}${extras ? ` (${extras})` : ''} × ${line.quantity} — ${formatDetailValue(moneyOf(line.price))}`;
};

function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500">
            <th className="py-1 text-start font-normal">البيان</th>
            <th className="py-1 text-start font-normal">في تحديث المتجر</th>
            <th className="py-1 text-start font-normal">في الطلب حالياً</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const differs = !sameValue(row.update, row.current);
            return (
              <tr key={row.key} className="border-t border-gray-100 align-top">
                <td className="py-1 text-gray-600">{row.label}</td>
                <td className={`py-1 break-words ${differs ? 'text-primary font-semibold' : ''}`}>
                  {formatDetailValue(row.update)}
                </td>
                <td className="py-1 break-words">{formatDetailValue(row.current)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReasonSummary({ reason }: { reason: StoreUpdateNotAppliedReason }) {
  const { getStatusLabel } = useStatusLabel();

  if ('status' in reason && typeof reason.status === 'string') {
    return (
      <p className="text-sm">
        حالة الطلب وقت وصول التحديث: <span className="font-semibold">{getStatusLabel(reason.status)}</span>
      </p>
    );
  }
  if ('unmapped' in reason && reason.unmapped) {
    const { index, title, externalVariantId } = reason.unmapped;
    return (
      <p className="text-sm">
        المنتج رقم {index + 1} في التحديث غير مربوط بمنتج في النظام:{' '}
        <span className="font-semibold">{title ?? externalVariantId ?? EMPTY_VALUE}</span>
      </p>
    );
  }
  if ('differences' in reason && Array.isArray(reason.differences)) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-sm">البيانات التي تم تعديلها على الطلب بعد إنشائه:</span>
        <div className="flex flex-wrap gap-1">
          {reason.differences.map((field) => (
            <span key={field} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-700">
              {orderFieldLabelOf(field)}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if ('shortage' in reason && isFailureStockShortage(reason.shortage)) {
    return <StockShortageDetails shortage={reason.shortage} />;
  }
  return null;
}

export function StoreUpdateDetails({
  details,
  order,
}: {
  details: StoreUpdateNotAppliedDetails;
  order: Order;
}) {
  const { update } = details;
  const phones = order.customers?.phone_numbers ?? [];
  const currentLines = (order.order_products ?? []).map((op) => {
    const info = mapOrderProductToVariantInfo(op);
    const attributes = info.attributes.map((attribute) => attribute.value).join(' / ');
    const extras = [attributes, info.sku ? `SKU ${info.sku}` : ''].filter(Boolean).join(' - ');
    return `${info.productName}${extras ? ` (${extras})` : ''} × ${op.quantity ?? 1} — ${formatDetailValue(moneyOf(op.price))}`;
  });

  const sections: { title: string; rows: ComparisonRow[] }[] = [
    {
      title: 'المبالغ والدفع',
      rows: [
        { key: 'totalCost', label: 'الإجمالي', update: moneyOf(update.money?.totalCost), current: moneyOf(order.totalCost) },
        { key: 'shippingCost', label: 'مصاريف الشحن', update: moneyOf(update.money?.shippingCost), current: moneyOf(order.shippingCost) },
        { key: 'couponDiscount', label: 'خصم الكوبون', update: moneyOf(update.money?.couponDiscount), current: moneyOf(order.couponDiscount) },
        { key: 'prepaidAmount', label: 'المبلغ المدفوع مسبقاً', update: moneyOf(update.money?.prepaidAmount), current: moneyOf(order.prepaidAmount) },
        { key: 'paymentMethod', label: 'طريقة الدفع', update: update.money?.paymentMethod, current: order.paymentMethod },
        { key: 'paymentStatus', label: 'حالة الدفع', update: paymentStatusLabelOf(update.money?.paymentStatus), current: paymentStatusLabelOf(order.paymentStatus) },
      ],
    },
    {
      title: 'العميل',
      rows: [
        { key: 'name', label: 'الاسم', update: update.customer?.name, current: order.customers?.name },
        { key: 'phone', label: 'الهاتف', update: update.customer?.phone, current: phones[0] },
        { key: 'altPhone', label: 'هاتف آخر', update: update.customer?.altPhone, current: phones[1] },
        { key: 'email', label: 'البريد الإلكتروني', update: update.customer?.email, current: order.customers?.email },
      ],
    },
    {
      title: 'العنوان',
      rows: [
        { key: 'governorate', label: 'المحافظة', update: update.address?.governorate, current: order.governorate },
        { key: 'city', label: 'المدينة', update: update.address?.city, current: order.city },
        { key: 'address', label: 'العنوان', update: update.address?.address, current: order.address },
        { key: 'externalGovernorate', label: 'المحافظة في المتجر', update: update.address?.externalGovernorate, current: order.externalGovernorate },
        { key: 'externalCity', label: 'المدينة في المتجر', update: update.address?.externalCity, current: order.externalCity },
        { key: 'returnShippingCost', label: 'مصاريف شحن المرتجع', update: moneyOf(update.address?.returnShippingCost), current: moneyOf(order.returnShippingCost) },
      ],
    },
    {
      title: 'الملاحظات',
      rows: [{ key: 'notes', label: 'ملاحظات', update: update.notes, current: order.notes }],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DetailGrid>
        <DetailField label="المتجر" ltr>
          {details.provider}
        </DetailField>
        <DetailField label="رقم الطلب في المتجر" ltr>
          {details.externalOrderId ?? EMPTY_VALUE}
        </DetailField>
        {details.event && (
          <DetailField label="نوع التحديث" ltr>
            {details.event}
          </DetailField>
        )}
      </DetailGrid>

      <ReasonSummary reason={details.reason} />

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-gray-600">المنتجات</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">في تحديث المتجر</span>
            <ul className="list-disc ps-5 text-sm">
              {update.lines.map((line, index) => (
                <li key={index}>{updateLineText(line)}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">في الطلب حالياً</span>
            <ul className="list-disc ps-5 text-sm">
              {currentLines.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">{section.title}</span>
          <ComparisonTable rows={section.rows} />
        </div>
      ))}
    </div>
  );
}
