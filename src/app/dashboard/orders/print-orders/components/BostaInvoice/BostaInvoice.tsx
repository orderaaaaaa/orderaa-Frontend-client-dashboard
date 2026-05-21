'use client';

import React, { useCallback } from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { InvoiceProps } from '../../types/invoice';
import { INVOICE_LABELS } from '../../constants/invoiceLabels';
import { ShippingType } from '@/types/orders';

export function BostaInvoice({ data, storeInfo, language }: InvoiceProps) {
  const labels = INVOICE_LABELS[language];
  const isAr = language === 'ar';
  const currency = isAr ? 'ج.م' : 'EGP';

  const areaDisplay = [data.customer.governorate, data.customer.city, data.area]
    .filter(Boolean)
    .join(' - ') || '-';

  const returnAddress = [data.merchantGovernorate, data.merchantCity]
    .filter(Boolean)
    .join(' - ') || '-';

  const productDescription = data.shipmentContent ||
    data.products
      .map((p) => `${p.name}${p.variant ? ` - ${p.variant}` : ''} X ${p.quantity}`)
      .join(', ');

  const totalPieces = data.products.reduce((sum, p) => sum + p.quantity, 0);

  const nonReceiptCost = data.returnShippingCost
    ?? data.nonReceiptPenalty
    ?? storeInfo.defaultReturnShippingCost
    ?? 0;

  const createdDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    : '-';

  const customerNotes = data.shippingNotes || 'no notes';

  const shippingTypeLabel = (() => {
    switch (data.shippingType) {
      case ShippingType.EXCHANGE: return labels.exchange;
      case ShippingType.RETURN: return labels.return;
      case ShippingType.PARTIAL_RETURN: return labels.partialReturn;
      default: return null;
    }
  })();

  const fullWidthBarcode = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const apply = () => {
      const svg = node.querySelector('svg');
      if (svg) {
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.width = '100%';
        svg.style.display = 'block';
      }
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(node, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="invoice-page bosta-invoice-page w-[100mm] bg-white text-[9px] text-black border-2 border-black rounded-lg overflow-hidden flex flex-col"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 0. Resend Banner - shown when order is a resend */}
      {data.isResend && (
        <div className="bg-amber-500 text-black border-b-2 border-black text-center py-1 px-2 font-extrabold text-[12px] tracking-wider uppercase">
          {labels.resend}
        </div>
      )}

      {/* 1. Top Barcode - full width */}
      <div ref={fullWidthBarcode} className="border-b-2 border-black py-1 px-4">
        <Barcode
          value={data.shippingId || ''}
          height={30}
          fontSize={5}
          margin={0}
          textMargin={1}
        />
      </div>

      {/* 2. Header: توصيل (start/right) | hub (center) | bosta logo (end/left) */}
      <div className="grid grid-cols-3 items-center border-b-2 border-black px-2 py-0.5">
        <div>
          {shippingTypeLabel ? (
            <span className="inline-block bg-black text-white text-[10px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-sm uppercase">
              {shippingTypeLabel}
            </span>
          ) : (
            <span className="text-[10px] font-bold">{labels.delivery}</span>
          )}
        </div>
        <div className="text-center text-[7px] text-black">-</div>
        <div className="text-end">
          <img
            src="/Icons/bosta.png"
            alt="Bosta"
            className="h-4 object-contain inline-block"
          />
        </div>
      </div>

      {/* 3. Main info block */}
      <div className="border-b-2 border-black">
        {/* Top row: Financial (start) + Zone label (end) */}
        <div className="grid grid-cols-[1fr_auto] border-b-2 border-black">
          <div className="flex flex-row items-center gap-3 px-2 py-1 text-[8px] border-e border-black">
            <div className="flex flex-row items-center gap-1">
              <p className="font-bold">{labels.codAmount}: </p>
              <p className="text-[11px] font-bold">{data.totalPrice}</p>
              <p className="text-[9px]">{currency}</p>
            </div>
            <div className="flex flex-row gap-1 items-center font-bold">
              <p>{labels.nonReceiptCost}: </p>
              <p>{nonReceiptCost} {currency}</p>
            </div>
          </div>
          <div className="min-w-[22mm] grid place-items-center bg-black">
            <p className="text-white text-[10px] font-bold">N-01</p>
          </div>
        </div>
        {/* Bottom row: Merchant/Recipient (start) + QR (end) */}
        <div className="grid grid-cols-[1fr_auto]">
          <div className="grid grid-cols-2 border-e border-black">
            <div className="border-e border-black px-2 py-1">
              <p className="text-xs font-bold text-black">{labels.deliverTo}:</p>
              <p className="text-[9px] font-bold">{data.customer.name}</p>
              <p className="text-[8px]">{data.customer.phoneNumbers[0] || '-'}</p>
            </div>
            <div className="px-2 py-1 font-bold">
              <p className="text-xs text-black">{labels.merchant}:</p>
              <p className="text-[9px]">{data.merchantName || '-'}</p>
            </div>
          </div>
          <div className="flex items-center justify-center min-w-[22mm] p-1.5">
            <QRCodeSVG value={data.shippingId || ''} size={50} level="L" />
          </div>
        </div>
      </div>

      {/* 4. Area */}
      <div className="border-b-2 border-black">
        <div className="px-2 py-0.5 text-[8px]">
          <span className="text-black font-bold">{labels.area}</span>
          <span className="text-black mx-0.5 font-bold">|</span>
          <span>{areaDisplay}</span>
        </div>

        {/* 5. Address */}
        <div className="px-2 py-0.5 text-[8px]">
          <span className="text-black font-bold">{labels.address}</span>
          <span className="text-black mx-0.5">|</span>
          <span className="leading-tight">{data.customer.address || '-'}</span>
        </div>

        {/* 6. Landmark */}
        <div className="px-2 py-0.5 text-[8px]">
          <span className="text-black font-bold">{labels.landmark}</span>
          <span className="text-black mx-0.5">|</span>
          <span>-</span>
        </div>
      </div>

      {/* 7. Open Shipment + Pieces */}
      <div className="px-2 py-1 text-[8px] flex items-center gap-2">
        <div className="flex items-center gap-1 border border-black rounded-sm px-2 py-0.5">
          <span className="font-bold">{labels.openShipment} : </span>
          <span className="font-bold">{data.canOpenShipment ? labels.yes : labels.no}</span>
        </div>
        <span className="border border-black rounded-sm px-2 py-0.5 font-bold">
          {totalPieces} {labels.pieces}
        </span>
      </div>

      {/* 8. Shipment Description */}
      <div className="border-b-2 border-black px-2 py-1 text-[8px]">
        <span className="text-black font-bold">{labels.shipmentDescription}</span>
        <span className="text-black mx-0.5">|</span>
        <br />
        <span>{productDescription}</span>
      </div>

      {/* 9. Bottom block: Notes/Ref/Return (start/right) + Tracking (end/left) */}
      <div className="grid grid-cols-[1fr_auto] border-b-2 border-black">
        {/* Start (RIGHT in RTL): Notes, Order Ref, Return Address */}
        <div className="py-1.5 text-[8px] flex flex-col justify-between">
          <div className="px-2 h-full flex flex-col justify-between">
            <p>
              <span className="font-bold">{labels.notes}</span>
              <span className="text-black mx-0.5">|</span>
              <span>{customerNotes || "-"}</span>
            </p>
            <p dir="ltr" className="text-left">
              <span className="font-bold">{labels.orderReference}:</span> #{data.orderCode}
            </p>
          </div>
          <div className="border-t-2 border-black px-2 pt-1">
            <p>
              <span className="font-bold">{labels.returnAddress}</span>
              <span className="mx-0.5">|</span>
              <span>{returnAddress}</span>
            </p>
          </div>
        </div>

        {/* End (LEFT in RTL): Tracking barcode + codes */}
        <div className="pt-1 flex flex-col items-center justify-center gap-0.5 min-w-[28mm]">
          <p className="text-[7px] text-black font-bold">{labels.trackingNumber}</p>
          <Barcode
            value={data.shippingId || ''}
            width={1}
            height={25}
            fontSize={7}
            margin={0}
            textMargin={1}
          />
          <p className="bg-black text-white text-[7px] font-bold w-full text-center">-</p>
          <p className="bg-black text-white text-[7px] font-bold w-full text-center">-</p>
        </div>
      </div>

      {/* 10. Footer: Created date */}
      <div className="px-2 py-0.5 text-[7px] text-black">
        <span className="font-bold">{labels.created}:</span> {createdDate}
      </div>

      {/* 11. Order Code Barcode */}
      <div className="border-t-2 border-black py-1 grid place-items-center">
        <Barcode
          value={data.orderCode}
          width={1.5}
          height={25}
          fontSize={7}
          margin={0}
          textMargin={1}
        />
      </div>
    </div>
  );
}
