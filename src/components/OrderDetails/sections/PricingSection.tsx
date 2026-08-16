import React from 'react';
import { LiaFileInvoiceDollarSolid, LiaTruckSolid } from 'react-icons/lia';
import { z } from 'zod';
import { EditableTextField } from '../fields/EditableTextField';
import { PaymentMethodSelect } from '../fields/PaymentMethodSelect';
import { PaymentStatusSelect } from '../fields/PaymentStatusSelect';
import { ShippingTypeSelect } from '../fields/ShippingTypeSelect';
import { Order } from '@/types/orders';
import { usePermissionCheck } from '@/hooks/usePermissions';

// Validation schema for price fields - only numbers allowed
const priceSchema = z.string().refine(
  (val) => val === '' || /^\d*\.?\d*$/.test(val),
  { message: 'يجب إدخال أرقام فقط' }
);

/**
 * Props for PricingSection component
 */
export interface PricingSectionProps {
  order: Order;
  onUpdate: (field: string, value: any) => Promise<Order>;
  onShippingTypeSelect?: (value: string) => void;
  pendingShippingType?: string | null;
  onSaveReturnContent?: (content: string) => Promise<void>;
  className?: string;
}

/**
 * PricingSection Component
 *
 * Displays price and payment information section
 *
 * @param props - Component props
 */
export function PricingSection({
  order,
  onUpdate,
  onShippingTypeSelect,
  pendingShippingType,
  onSaveReturnContent,
  className = '',
}: PricingSectionProps) {
  // Every field here saves through PATCH /orders/:id (`orders:update`).
  const { hasPermission } = usePermissionCheck();
  const canEdit = hasPermission('orders:update');

  // T8. Every amount is a decimal string from the API and is rendered as-is —
  // parsing it into a number to do arithmetic here would put money through a
  // float, and would also let this page disagree with the order card.
  const shippingDeduction = order.shippingCost ? String(order.shippingCost) : '0';

  return (
    <div className={`flex flex-col justify-start gap-2 ${className}`}>
      <h2 className="text-primary font-semibold">السعر و الدفع</h2>

      {order.isCollected && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-gray-200 bg-gray-50/70 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">المبلغ المحصل</span>
            <span className="text-sm font-bold text-gray-900">
              {order.collectedAmount} جنيه
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">المبلغ المورد</span>
            <span className="text-sm font-bold text-green-700">
              {order.suppliedAmount} جنيه
            </span>
            {/* The 900 → 800 arithmetic stays legible instead of being a bare
                number. A zero deduction is stated rather than implied. */}
            <span className="text-[11px] text-gray-500">
              {order.collectedAmount} − {shippingDeduction} (شحن)
            </span>
          </div>

          {order.isPartiallyPaid && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              مدفوع جزئياً — ما زال هناك مبلغ مستحق
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EditableTextField
          label="السعر"
          value={String(order.totalCost)}
          icon={LiaFileInvoiceDollarSolid}
          inputType="number"
          validationSchema={priceSchema}
          onSave={async (value) => {
            await onUpdate('totalCost', Number(value));
          }}
          canEdit={canEdit}
        />
        <EditableTextField
          label="سعر الشحن"
          value={order.shippingCost ? String(order.shippingCost) : undefined}
          icon={LiaTruckSolid}
          inputType="number"
          validationSchema={priceSchema}
          onSave={async (value) => {
            await onUpdate('shippingCost', Number(value));
          }}
          canEdit={canEdit}
        />
        <ShippingTypeSelect
          value={pendingShippingType || order.shippingType}
          onChange={(value) => {
            if (onShippingTypeSelect) {
              onShippingTypeSelect(value);
            } else {
              onUpdate('shippingType', value);
            }
          }}
          canEdit={canEdit}
        />
        {(() => {
          const effectiveType = pendingShippingType ?? order.shippingType;
          return effectiveType && effectiveType !== 'DELIVERY';
        })() && (
          <EditableTextField
            label="محتوى شحنة الاسترجاع"
            value={order.returnShipmentContent ?? undefined}
            inputType="text"
            onSave={async (value) => {
              if (onSaveReturnContent) {
                await onSaveReturnContent(value);
              } else {
                await onUpdate('returnShipmentContent', value);
              }
            }}
            canEdit={canEdit}
          />
        )}
        <PaymentMethodSelect
          value={order.paymentMethod}
          onChange={async (value) => {
            await onUpdate('paymentMethod', value);
          }}
          canEdit={canEdit}
        />
        <PaymentStatusSelect
          value={order.paymentStatus}
          onChange={async (value) => {
            await onUpdate('paymentStatus', value);
          }}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
