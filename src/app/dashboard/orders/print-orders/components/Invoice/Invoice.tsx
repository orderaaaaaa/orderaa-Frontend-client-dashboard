'use client';

import React from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { LiaPhoneSolid, LiaInfoCircleSolid } from 'react-icons/lia';
import { InvoiceData, InvoiceStoreInfo, InvoiceLanguage } from '../../types/invoice';
import { INVOICE_LABELS } from '../../constants/invoiceLabels';

interface InvoiceProps {
  data: InvoiceData;
  storeInfo: InvoiceStoreInfo;
  language: InvoiceLanguage;
}

export function Invoice({ data, storeInfo, language }: InvoiceProps) {
  const labels = INVOICE_LABELS[language];
  const storeName = language === 'ar' ? storeInfo.name : storeInfo.nameEn;

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
      className="invoice-page w-[210mm] min-h-[297mm] bg-white p-1 text-sm"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Store Name Header */}
      <div className="text-center mb-3 pb-2">
        <h1 className="text-3xl font-bold tracking-widest">{storeName}</h1>
      </div>

      {/* Recipient Details Section */}
      <div className="grid grid-cols-2 bg-black text-white">
        <span className="py-1.5 px-2 text-sm font-bold text-start">
          {labels.phoneNumber} :
        </span>
        <span className="py-1.5 px-2 text-sm font-bold text-start">
          {labels.recipientDetails}
        </span>
      </div>
      <div className="grid grid-cols-2 border border-t-0 border-black font-bold text-sm">
        <div className="p-2 border-e border-black">
          <div className="grid grid-cols-[auto_auto_1fr] items-center justify-start gap-1 mb-1">
            <LiaPhoneSolid className="size-4" />
            <span className="text-gray-700">{labels.number1}:</span>
            <span className="font-bold">{data.customer.phoneNumbers[0] || '-'}</span>
          </div>
          <div className="grid grid-cols-[auto_auto_1fr] items-center gap-1">
            <LiaPhoneSolid className="size-4" />
            <span className="text-gray-700">{labels.number2}:</span>
            <span className="font-bold">{data.customer.phoneNumbers[1] || '-'}</span>
          </div>
        </div>
        <div className="p-2">
          <p className="font-bold mb-0.5 text-start">
            {data.customer.name}
          </p>
          <p className="text-start">
            {location}
          </p>
        </div>
      </div>

      {/* Address Section */}
      <div className="grid grid-cols-[auto_1fr] border border-black mb-3 font-bold text-lg">
        <div className="bg-black text-white py-2 px-3 grid place-items-center">
          {labels.address}
        </div>
        <p className="p-2 text-start leading-relaxed">
          {data.customer.address || '-'}
        </p>
      </div>

      {/* Order Barcode */}
      <div className="grid place-items-center my-3">
        <div
          className="w-full relative bg-white p-6 grid place-items-center
            before:absolute before:top-0 before:left-0 before:h-2 before:w-full
            before:bg-[repeating-linear-gradient(-45deg,#000_0_30px,transparent_30px_40px)]
            after:absolute after:bottom-0 after:left-0 after:h-2 after:w-full
            after:bg-[repeating-linear-gradient(-45deg,#000_0_30px,transparent_30px_40px)]"
        >
          <Barcode
            value={data.orderCode}
            width={1.5}
            height={45}
            fontSize={0}
            margin={0}
          />
          <p className="text-lg font-bold tracking-wider mt-1">{data.orderCode}</p>
        </div>
      </div>

      {/* Packaging Notes Section */}
      <div className="grid grid-cols-2 bg-black text-white">
        <span className="py-1.5 px-2 text-sm font-bold text-start">
          {labels.shipmentContents}:
        </span>
        <span className="py-1.5 px-2 text-sm font-bold text-start">
          {labels.packagingNotes}
        </span>
      </div>
      <div className="grid grid-cols-2 border border-t-0 border-black">
        <div className="p-2 border-e border-black">
          {data.products.map((product, index) => (
            <div key={index} className="grid grid-cols-[auto_1fr] gap-2 mb-0.5">
              <span className="text-sm">
                {product.variant}
              </span>
              <span className="text-sm text-start">
                {formatProductName(product)}
              </span>
            </div>
          ))}
        </div>
        <div className="p-2">
          <div className="grid grid-cols-[auto_1fr] items-start gap-1.5">
            <LiaInfoCircleSolid className="size-5" />
            <p className="text-sm text-start leading-relaxed">
              {data.packagingNotes || labels.packagingWarning}
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Notes Section */}
      <div className="grid grid-cols-2 bg-black text-white">
        <span className="py-1.5 px-2 text-sm font-bold text-start">
          {labels.shippingInfo}
        </span>
        <span className="py-1.5 px-2 text-sm font-bold text-start">
          {labels.shippingNotes}
        </span>
      </div>
      <div className="grid grid-cols-2 border border-t-0 border-black">
        <div className="p-2 space-y-1 border-e border-black">
          <div className="grid grid-cols-2 justify-between border-b border-gray-300 pb-1">
            <span className="">{labels.allowOpenShipment}</span>
            <span className="text-sm font-bold text-end">
              {data.shipping.allowOpenShipment ? labels.yes : labels.no}
            </span>
          </div>
          <div className="grid grid-cols-2 justify-between border-b border-gray-300 pb-1">
            <span className="">{labels.paymentMethod} :</span>
            <span className="text-sm font-bold text-end">{getPaymentMethodDisplay()}</span>
          </div>
          <div className="grid grid-cols-2 justify-between border-b border-gray-300 pb-1">
            <span className="">{labels.paymentStatus} :</span>
            <span className="text-sm font-bold text-end">{getPaymentStatusDisplay()}</span>
          </div>
          <div className="grid grid-cols-2 justify-between">
            <span className="">{labels.shipmentStatus}</span>
            <span className="text-sm font-bold text-end">{data.shipping.shipmentStatus || '-'}</span>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-[auto_1fr] items-start gap-2 p-2">
            <LiaInfoCircleSolid className="size-5" />
            <p className="text-sm text-start leading-relaxed">
              {data.shippingNotes || labels.packagingWarning}
            </p>
          </div>

          <div className="grid grid-cols-2 bg-black">
            <span className="py-1.5 px-2.5 font-bold text-sm text-white">
              {labels.customerSchedule}:
            </span>
          </div>
          <p className="py-1.5 px-2.5 text-sm font-bold text-center text-black block">
            {timeDisplay}
          </p>
        </div>
      </div>


      {/* Total Price */}
      <div className="bg-black py-3.5 px-4 mb-1.5">
        <p className="text-white text-xl font-bold text-center">
          {labels.totalPrice}:{" "}{data.totalPrice} EGP
        </p>
      </div>

      {/* Non-Receipt Penalty */}
      <p className="text-lg font-bold mb-3 border-y border-black py-2.5">
        {labels.nonReceiptMessage} {data.nonReceiptPenalty || 0} EGP.
      </p>

      {/* Shipping Barcode */}
      <div className="grid place-items-center my-3">
        <span className="font-bold text-lg">{labels.shippingBarcode}</span>
        <Barcode
          value={data.orderCode}
          width={1.5}
          height={45}
          fontSize={0}
          margin={0}
        />
        <span className="text-[11px] font-bold tracking-wider mt-1">{data.orderCode}</span>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-4 mt-2.5 pt-2">
        <div className=' '>
          <div className="grid place-items-center">
            <QRCodeSVG
              value={storeInfo.contactQRValue}
              size={260}
              level="L"
              className='p-5 border border-black rounded-xl'
            />
          </div>
          <p className="text-xl text-center mt-1">{labels.scanToContact}</p>
        </div>
        <div>
          <p className="text-xl mb-1">
            {labels.contactMessage}
          </p>

          <hr />

          <p className="text-xl mb-1">
            <span className="font-bold">{labels.senderName}: </span>
            {storeName}
          </p>
          <p className="text-xl mb-1">
            <span>{labels.workNumbers}:</span>
          </p>
          <div className="grid grid-cols-2 items-center gap-1 text-base font-bold">
            <div className="grid grid-cols-[auto_auto_auto] items-center justify-start gap-2">
              <LiaPhoneSolid className="size-4" />
              <span>{storeInfo.phoneNumbers[0] || ''}</span>
            </div>
            <div className="grid grid-cols-[auto_auto] items-center justify-start gap-2">
              <LiaPhoneSolid className="size-4" />
              <span>{storeInfo.phoneNumbers[1] || ''}</span>
            </div>
          </div>
        </div>

      </div>
    </div >
  );
}
