import React from 'react';
import { LiaFileInvoiceDollarSolid, LiaTruckSolid, LiaExchangeAltSolid, LiaUndoAltSolid, LiaRandomSolid } from 'react-icons/lia';
import { z } from 'zod';
import { EditableTextField } from '../fields/EditableTextField';
import { PaymentMethodSelect } from '../fields/PaymentMethodSelect';
import { PaymentStatusSelect } from '../fields/PaymentStatusSelect';
import { Order, ShippingType } from '@/types/orders';

const SHIPPING_TYPE_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string }> = {
  [ShippingType.DELIVERY]: { label: 'توصيل', icon: LiaTruckSolid, bg: 'bg-blue-100', text: 'text-blue-600' },
  [ShippingType.EXCHANGE]: { label: 'استبدال', icon: LiaExchangeAltSolid, bg: 'bg-orange-100', text: 'text-orange-600' },
  [ShippingType.RETURN]: { label: 'مرتجع', icon: LiaUndoAltSolid, bg: 'bg-red-100', text: 'text-red-600' },
  [ShippingType.PARTIAL_RETURN]: { label: 'مرتجع جزئي', icon: LiaRandomSolid, bg: 'bg-amber-100', text: 'text-amber-600' },
};

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
  className?: string;
}

/**
 * PricingSection Component
 *
 * Displays price and payment information section
 *
 * @param props - Component props
 */
export function PricingSection({ order, onUpdate, className = '' }: PricingSectionProps) {
  return (
    <div className={`flex flex-col justify-start gap-2 ${className}`}>
      <h2 className="text-primary font-semibold">السعر و الدفع</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
        <EditableTextField
          label="السعر"
          value={String(order.totalCost)}
          icon={LiaFileInvoiceDollarSolid}
          inputType="number"
          validationSchema={priceSchema}
          onSave={async (value) => {
            await onUpdate('totalCost', Number(value));
          }}
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
        />
        {order.shippingType && SHIPPING_TYPE_LABELS[order.shippingType] && (() => {
          const badge = SHIPPING_TYPE_LABELS[order.shippingType!];
          const Icon = badge.icon;
          return (
            <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
              <p className="font-bold text-[#121212]">نوع الشحنة</p>
              <div className={`flex gap-2 items-center py-2 px-3 rounded-[5px] font-bold text-[15px] ${badge.bg}`}>
                <Icon className={`w-5 h-5 ${badge.text}`} />
                <span className={badge.text}>{badge.label}</span>
              </div>
            </div>
          );
        })()}
        <PaymentMethodSelect
          value={order.paymentMethod}
          onChange={async (value) => {
            await onUpdate('paymentMethod', value);
          }}
        />
        <PaymentStatusSelect
          value={order.paymentStatus}
          onChange={async (value) => {
            await onUpdate('paymentStatus', value);
          }}
        />
      </div>
    </div>
  );
}
