'use client';

import React from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { LiaPhoneSolid, LiaInfoCircleSolid } from 'react-icons/lia';
import { InvoiceProps } from '../../types/invoice';
import { INVOICE_LABELS } from '../../constants/invoiceLabels';
import { providers } from '@/app/dashboard/link-shipping-company/constants/providers';

const normalizeShippingKey = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

const getShippingCompanyLogo = (shippingCompany?: string) => {
  if (!shippingCompany) return undefined;
  const key = normalizeShippingKey(shippingCompany);
  if (!key) return undefined;
  return providers.find(
    (p) =>
      normalizeShippingKey(p.id) === key ||
      normalizeShippingKey(p.name) === key,
  )?.logo;
};

export function Invoice({ data, storeInfo, language }: InvoiceProps) {
  const labels = INVOICE_LABELS[language];
  const shippingCompanyLogo = getShippingCompanyLogo(data.shippingCompany);
 // const storeName = language === 'ar' ? storeInfo.name : storeInfo.nameEn;

  const location = [data.customer.governorate, data.customer.city]
    .filter(Boolean)
    .join(' - ') || '-';

  const getPaymentStatusDisplay = () => {
    const status = data.shipping.paymentStatus?.toLowerCase();
    if (status === 'paid' || status === 'مدفوع') {
      return labels.paid;
    }
    return labels.unpaid;
  };

  const getPaymentMethodDisplay = () => {
    const method = data.shipping.paymentMethod?.toLowerCase();
    if (method?.includes('delivery') || method === 'cod' || method?.includes('استلام') || method?.includes('كاش')) {
      return labels.cashOnDelivery;
    }
    return data.shipping.paymentMethod || labels.cashOnDelivery;
  };

  const formatProductName = (product: { name: string; quantity: number; variant?: string }) => {
    return product.name || 'Product';
  };

  const timeDisplay = [data.schedule.timeFrom, data.schedule.timeTo]
    .filter(Boolean)
    .join(' | ');

  return (
    <div
      className="invoice-page w-[100mm] min-h-[150mm] bg-white p-1 text-[9px]"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Logo */}
      {storeInfo.logo && (
        <div className="flex justify-center mb-1">
          <img
            src={storeInfo.logo}
            alt="Store Logo"
            className="h-10 max-w-[60mm] object-contain"
          />
        </div>
      )}

      {/* Store Name Header */}
      {/* <div className="text-center mb-1 pb-1">
        <h1 className="text-base font-bold tracking-wide">{storeName}</h1>
      </div> */}

      {/* Recipient Details Section */}
      <div className="grid grid-cols-2 bg-black text-white">
        <span className="py-0.5 px-1 text-[8px] font-bold text-start">
          {labels.phoneNumber} :
        </span>
        <span className="py-0.5 px-1 text-[8px] font-bold text-start">
          {labels.recipientDetails}
        </span>
      </div>

      <div className="grid grid-cols-2 border border-t-0 border-black font-bold text-[8px]">
        <div className="p-1 border-e border-black">
          <div className="grid grid-cols-[auto_auto_1fr] items-center justify-start gap-0.5 mb-0.5">
            <LiaPhoneSolid className="size-2.5" />
            <span className="text-gray-700">{labels.number1}:</span>
            <span className="font-bold">{data.customer.phoneNumbers[0] || '-'}</span>
          </div>
          <div className="grid grid-cols-[auto_auto_1fr] items-center gap-0.5">
            <LiaPhoneSolid className="size-2.5" />
            <span className="text-gray-700">{labels.number2}:</span>
            <span className="font-bold">{data.customer.phoneNumbers[1] || '-'}</span>
          </div>
        </div>
        <div className="p-1">
          <p className="font-bold mb-0.5 text-start">
            {data.customer.name}
          </p>
          <p className="font-bold text-start">
            {location}
          </p>
        </div>
      </div>

      {/* Address Section */}
      <div className="grid grid-cols-[auto_1fr] border border-black mb-1 font-bold text-[9px]">
        <div className="bg-black text-white py-1 px-1.5 grid place-items-center">
          {labels.address}
        </div>
        <p className="p-1 text-start leading-tight">
          {data.customer.address || '-'}
        </p>
      </div>

      {/* Order Barcode */}
      <div className="grid place-items-center my-1">
        <div
          className="w-full relative bg-white p-2 grid place-items-center
            before:absolute before:top-0 before:left-0 before:h-1 before:w-full
            before:bg-[repeating-linear-gradient(-45deg,#000_0_15px,transparent_15px_20px)]
            after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full
            after:bg-[repeating-linear-gradient(-45deg,#000_0_15px,transparent_15px_20px)]"
        >
          <Barcode
            value={data.orderCode}
            width={2}
            height={25}
            fontSize={0}
            margin={0}
          />
          <p className="text-[10px] font-bold tracking-wider mt-0.5">{data.orderCode}</p>
        </div>
      </div>



      {/* Packaging Notes Section */}
      <div className="grid grid-cols-2 bg-black text-white">
        <span className="py-0.5 px-1 text-[8px] font-bold text-start">
          {labels.shipmentContents}:
        </span>
        <span className="py-0.5 px-1 text-[8px] font-bold text-start">
          {labels.packagingNotes}
        </span>
      </div>
      <div className="grid grid-cols-2 border border-t-0 border-black">
        <div className="p-1 border-e border-black">
          {data.products.map((product, index) => (
            <div key={index} className="mb-0.5">
              <div className="grid grid-cols-[auto_1fr] gap-1">
                <span className="text-[8px] font-bold">
                  {product.variant}
                </span>
                <span className="text-[8px] font-bold text-left">
                  {formatProductName(product)}
                </span>
              </div>
              {product.sku && (
                <span className="text-[7px] text-black">
                  SKU: {product.sku}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="p-1">
          <div className="grid grid-cols-[auto_1fr] items-start gap-0.5">
            <LiaInfoCircleSolid className="size-2.5" />
            <p className="text-[8px] font-bold text-start leading-tight">
              {data.packagingNotes || ''}
            </p>
          </div>
        </div>
      </div>


      {/* Shipping Notes Section */}
      <div className="grid grid-cols-2 bg-black text-white">
        <span className="py-0.5 px-1 text-[8px] font-bold text-start">
          {labels.shippingInfo}
        </span>
        <span className="py-0.5 px-1 text-[8px] font-bold text-start">
          {labels.shippingNotes}
        </span>
      </div>
      <div className="grid grid-cols-2 border border-t-0 border-black text-[8px]">
        <div className="p-1 space-y-0.5 border-e border-black">
          <div className="grid grid-cols-2 justify-between border-b border-gray-300 pb-0.5">
            <span>{labels.allowOpenShipment}</span>
            <span className="font-bold text-end">
              {storeInfo.canOpenShipment ? labels.yes : labels.no}
            </span>
          </div>
          <div className="grid grid-cols-2 justify-between border-b border-gray-300 pb-0.5">
            <span>{labels.paymentMethod} :</span>
            <span className="font-bold text-end">{getPaymentMethodDisplay()}</span>
          </div>
          <div className="grid grid-cols-2 justify-between border-b border-gray-300 pb-0.5">
            <span>{labels.paymentStatus} :</span>
            <span className="font-bold text-end">{getPaymentStatusDisplay()}</span>
          </div>
          <div className="grid grid-cols-2 justify-between">
            <span>{labels.shipmentStatus}</span>
            <span className="font-bold text-end">{data.shipping.shipmentStatus || '-'}</span>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-[auto_1fr] items-start gap-0.5 p-1 flex-1">
            <LiaInfoCircleSolid className="size-2.5 mt-0.5" />
            <p className="text-[8px] font-bold text-start leading-tight">
              {data.shippingNotes || ''}
            </p>
          </div>

          <div className="bg-black px-1 py-0.5">
            <span className="font-bold text-[8px] text-white">
              {labels.customerSchedule}:
            </span>
          </div>
          <div className="px-1 py-1 text-[8px] font-bold text-center text-black min-h-[16px] bg-white">
            {timeDisplay || ' '}
          </div>
        </div>
      </div>


      {/* Total Price */}
      <div className="bg-black py-1.5 px-2 mb-1">
        <p className="text-white text-base font-bold text-center">
          {labels.totalPrice}:{" "}{data.totalPrice} EGP
        </p>
      </div>

      {/* Non-Receipt Penalty & Product Count */}
      <div className="grid grid-cols-2 items-center text-[9px] font-bold mb-1 border-y border-black py-1">
        <span>{labels.nonReceiptMessage} {data.nonReceiptPenalty ?? storeInfo.defaultReturnShippingCost ?? 0} EGP.</span>
        <span>{labels.productCount}: {data.products.length}</span>
      </div>

      {/* Shipping Barcode + Shipping Company Logo */}
      {(data.shippingId || data.shippingCompany) && (
        <div className="grid grid-cols-2 items-center my-1 border-y border-black py-2">
          <div className="flex flex-col items-center justify-center px-2 border-e border-black">
            {data.shippingId ? (
              <>
                <span className="font-bold text-[9px]">{labels.shippingBarcode}</span>
                <Barcode
                  value={data.shippingId}
                  width={1.6}
                  height={25}
                  fontSize={0}
                  margin={0}
                />
                <span className="text-[8px] font-bold tracking-wider mt-0.5">{data.shippingId}</span>
              </>
            ) : (
              <span className="text-[9px] font-bold text-gray-500">-</span>
            )}
          </div>
          <div className="flex items-center justify-center px-2">
            {shippingCompanyLogo ? (
              <img
                src={shippingCompanyLogo}
                alt={data.shippingCompany || 'Shipping Company'}
                className="h-12 max-w-[30mm] object-contain"
              />
            ) : (
              <span className="font-bold text-[10px] text-black uppercase tracking-wider">
                {data.shippingCompany || '-'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="grid grid-cols-2 gap-2 mt-1 pt-1">
        {/* TODO: re-enable QR code when ready */}
        <div className="hidden">
          <div className="grid place-items-center">
            <QRCodeSVG
              value={storeInfo.contactQRValue}
              size={100}
              level="L"
              className='p-1 border border-black rounded-lg'
            />
          </div>
          <p className="text-[8px] text-center">{labels.scanToContact}</p>
        </div>
        <div className='grid place-content-center col-span-2'>
          <p className="text-[10px] mb-0.5">
            {labels.contactMessage}
          </p>

          <hr />

          {/* <p className="text-[10px] mb-0.5">
            <span className="font-bold">{labels.senderName}: </span>
            {storeName}
          </p> */}
          {storeInfo.phoneNumbers.length > 0 && (
            <>
              <p className="text-[10px] mb-0.5">
                <span>{labels.workNumbers}:</span>
              </p>
              <div className="grid grid-cols-2 items-center gap-0.5 text-[10px] font-bold">
                {storeInfo.phoneNumbers[0] && (
                  <div className="grid grid-cols-[auto_auto] items-center justify-start gap-1">
                    <LiaPhoneSolid className="size-2" />
                    <span>{storeInfo.phoneNumbers[0]}</span>
                  </div>
                )}
                {storeInfo.phoneNumbers[1] && (
                  <div className="grid grid-cols-[auto_auto] items-center justify-start gap-1">
                    <LiaPhoneSolid className="size-2" />
                    <span>{storeInfo.phoneNumbers[1]}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div >
  );
}
