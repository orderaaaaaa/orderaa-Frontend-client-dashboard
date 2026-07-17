import React from 'react';
import { LiaFileInvoiceDollarSolid, LiaTruckSolid } from 'react-icons/lia';
import { z } from 'zod';
import { EditableTextField } from '../fields/EditableTextField';
import { PaymentMethodSelect } from '../fields/PaymentMethodSelect';
import { PaymentStatusSelect } from '../fields/PaymentStatusSelect';
import { ShippingTypeSelect } from '../fields/ShippingTypeSelect';
import { Order } from '@/types/orders';

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
  return (
    <div className={`flex flex-col justify-start gap-2 ${className}`}>
      <h2 className="text-primary font-semibold">السعر و الدفع</h2>
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
        <ShippingTypeSelect
          value={pendingShippingType || order.shippingType}
          onChange={(value) => {
            if (onShippingTypeSelect) {
              onShippingTypeSelect(value);
            } else {
              onUpdate('shippingType', value);
            }
          }}
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
          />
        )}
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
