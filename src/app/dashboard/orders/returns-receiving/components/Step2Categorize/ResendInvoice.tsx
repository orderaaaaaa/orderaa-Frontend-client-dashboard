'use client';

import Barcode from 'react-barcode';
import { LiaExclamationTriangleSolid, LiaUndoAltSolid } from 'react-icons/lia';
import {
  getCustomerDisplay,
  type GeneratedResendCode,
  type ReturnOrder,
} from '../../types';

interface ResendInvoiceProps {
  order: ReturnOrder;
  generated: GeneratedResendCode;
}

export function ResendInvoice({ order, generated }: ResendInvoiceProps) {
  const { name, phone } = getCustomerDisplay(order);
  return (
    <div className="invoice-page bg-white text-black p-4 w-full text-xs font-sans flex flex-col gap-2 border border-black/80">
      <div className="flex items-center justify-between border-b-2 border-black pb-1">
        <div className="flex items-center gap-1.5">
          <LiaUndoAltSolid className="w-4 h-4" />
          <span className="font-bold text-sm">إعادة إرسال</span>
        </div>
        <span className="font-mono text-[11px] font-semibold">
          {generated.newShipmentCode}
        </span>
      </div>

      <div className="grid place-items-center my-1">
        <div className="bg-white p-1 grid place-items-center">
          <Barcode
            value={generated.newShipmentCode}
            width={2}
            height={40}
            fontSize={0}
            margin={0}
          />
          <p className="text-[10px] font-bold tracking-wider mt-0.5">
            {generated.newShipmentCode}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-dashed border-black/60 pt-2">
        <Row label="الطلب الأصلي" value={order.code} mono />
        <Row label="العميل" value={name} />
        <Row label="الجوال" value={phone} mono />
        <Row label="المحافظة" value={order.governorate ?? '-'} />
      </div>

      <div className="flex items-center justify-center gap-1.5 border border-dashed border-amber-600 bg-amber-50 text-amber-800 rounded-md py-1 px-2 mt-1">
        <LiaExclamationTriangleSolid className="w-4 h-4" />
        <span className="text-[10px] font-bold">
          وضع تجريبي — كود محلي، لا يُستخدم تشغيلياً
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-black/70">{label}</span>
      <span
        className={`text-[11px] font-semibold ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
