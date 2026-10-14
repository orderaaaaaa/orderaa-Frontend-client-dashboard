'use client';

import React, { useCallback } from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { InvoiceProps, InvoiceProduct } from '../../types/invoice';
import { INVOICE_LABELS } from '../../constants/invoiceLabels';
import { integrationLogoOf } from '@/lib/shippingCompanies';
import { ShippingType } from '@/types/orders';

export function TurboInvoice({ data, storeInfo, language }: InvoiceProps) {
  const labels = INVOICE_LABELS[language];
  const isAr = language === 'ar';
  const currency = isAr ? 'ج.م' : 'EGP';
  const logo = integrationLogoOf('TURBO');

  const areaDisplay = [data.customer.governorate, data.customer.city, data.area]
    .filter(Boolean)
    .join(' - ') || '-';

  const returnAddress = [data.merchantGovernorate, data.merchantCity]
    .filter(Boolean)
    .join(' - ') || '-';

  const describe = (p: InvoiceProduct) => {
    const attrs = [
      ...(p.attributes ?? []).map((a) => a.value),
      ...(p.customVariants ?? []).map((c) => `${c.label}: ${c.value}`),
    ].join(' / ');
    return `${p.name}${attrs ? ` - ${attrs}` : ''} X ${p.quantity}`;
  };
  const productDescription = data.shipmentContent ||
    data.products.map(describe).join(', ');

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

  const hasAwb = Boolean(data.shippingId);

  return (
    <div
      className="invoice-page turbo-invoice-page w-[100mm] bg-white text-[9px] text-black border-2 border-black rounded-lg overflow-hidden flex flex-col"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {data.isResend && (
        <div className="bg-amber-500 text-black border-b-2 border-black text-center py-1 px-2 font-extrabold text-[12px] tracking-wider uppercase">
          {labels.resend}
        </div>
      )}

      {hasAwb ? (
        <div ref={fullWidthBarcode} className="border-b-2 border-black py-1 px-4">
          <p className="text-[7px] font-bold text-center">{labels.shippingBarcode}</p>
          <Barcode
            value={data.shippingId as string}
            height={30}
            fontSize={5}
            margin={0}
            textMargin={1}
          />
        </div>
      ) : (
        <div className="border-b-2 border-black py-1 px-2 text-center text-[8px] font-bold">
          {labels.shippingBarcode}: -
        </div>
      )}

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
        <div className="text-center text-[7px] text-black font-bold">TURBO</div>
        <div className="text-end">
          {logo ? (
            <img
              src={logo}
              alt="Turbo"
              className="h-4 object-contain inline-block"
            />
          ) : (
            <span className="text-[10px] font-extrabold">Turbo</span>
          )}
        </div>
      </div>

      <div className="border-b-2 border-black">
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
            <p className="text-white text-[10px] font-bold">TURBO</p>
          </div>
        </div>
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
            {hasAwb ? (
              <QRCodeSVG value={data.shippingId as string} size={50} level="L" />
            ) : (
              <span className="text-[8px] font-bold">-</span>
            )}
          </div>
        </div>
      </div>

      <div className="border-b-2 border-black">
        <div className="px-2 py-0.5 text-[8px]">
          <span className="text-black font-bold">{labels.area}</span>
          <span className="text-black mx-0.5 font-bold">|</span>
          <span>{areaDisplay}</span>
        </div>

        <div className="px-2 py-0.5 text-[8px]">
          <span className="text-black font-bold">{labels.address}</span>
          <span className="text-black mx-0.5">|</span>
          <span className="leading-tight">{data.customer.address || '-'}</span>
        </div>

        <div className="px-2 py-0.5 text-[8px]">
          <span className="text-black font-bold">{labels.landmark}</span>
          <span className="text-black mx-0.5">|</span>
          <span>-</span>
        </div>
      </div>

      <div className="px-2 py-1 text-[8px] flex items-center gap-2">
        <div className="flex items-center gap-1 border border-black rounded-sm px-2 py-0.5">
          <span className="font-bold">{labels.openShipment} : </span>
          <span className="font-bold">{data.canOpenShipment ? labels.yes : labels.no}</span>
        </div>
        <span className="border border-black rounded-sm px-2 py-0.5 font-bold">
          {totalPieces} {labels.pieces}
        </span>
      </div>

      <div className="border-b-2 border-black px-2 py-1 text-[8px]">
        <span className="text-black font-bold">{labels.shipmentDescription}</span>
        <span className="text-black mx-0.5">|</span>
        <br />
        <span>{productDescription}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto] border-b-2 border-black">
        <div className="py-1.5 text-[8px] flex flex-col justify-between">
          <div className="px-2 h-full flex flex-col justify-between">
            <p>
              <span className="font-bold">{labels.notes}</span>
              <span className="text-black mx-0.5">|</span>
              <span>{customerNotes || '-'}</span>
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

        <div className="pt-1 flex flex-col items-center justify-center gap-0.5 min-w-[28mm]">
          <p className="text-[7px] text-black font-bold">{labels.trackingNumber}</p>
          {hasAwb ? (
            <Barcode
              value={data.shippingId as string}
              width={1}
              height={25}
              fontSize={7}
              margin={0}
              textMargin={1}
            />
          ) : (
            <p className="text-[8px] font-bold">-</p>
          )}
          <p className="bg-black text-white text-[7px] font-bold w-full text-center">-</p>
          <p className="bg-black text-white text-[7px] font-bold w-full text-center">-</p>
        </div>
      </div>

      <div className="px-2 py-0.5 text-[7px] text-black">
        <span className="font-bold">{labels.created}:</span> {createdDate}
      </div>

      <div className="border-t-2 border-black py-1 grid place-items-center">
        <p className="text-[7px] font-bold">{labels.orderReference}</p>
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
