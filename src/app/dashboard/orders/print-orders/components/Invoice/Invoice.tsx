'use client';

import React from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { InvoiceData, InvoiceStoreInfo, InvoiceLanguage } from '../../types/invoice';
import { INVOICE_LABELS } from '../../constants/invoiceLabels';

interface InvoiceProps {
  data: InvoiceData;
  storeInfo: InvoiceStoreInfo;
  language: InvoiceLanguage;
}

export function Invoice({ data, storeInfo, language }: InvoiceProps) {
  const isRTL = language === 'ar';
  const labels = INVOICE_LABELS[language];
  const storeName = isRTL ? storeInfo.name : storeInfo.nameEn;

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
    const variant = product.variant?.trim() ? ` ${product.variant}` : '';
    return `${product.name || 'Product'}${variant}`;
  };

  const timeDisplay = [data.schedule.timeFrom, data.schedule.timeTo]
    .filter(Boolean)
    .join(' | ');

  return (
    <div
      className="invoice-page w-[210mm] min-h-[297mm] bg-white p-5 text-[9px] font-sans"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Store Name Header */}
      <div className="text-center mb-3 pb-2">
        <h1 className="text-3xl font-bold tracking-widest">{storeName}</h1>
      </div>

      {/* Recipient Details Section */}
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} bg-black text-white`}>
        <span className="py-1.5 px-2 text-[9px] font-bold">{labels.recipientDetails}</span>
        <span className={`py-1.5 px-2 text-[9px] font-bold ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
          {labels.phoneNumber} :
        </span>
      </div>
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} border border-t-0 border-black mb-2`}>
        <div className={`flex-1 p-2 ${isRTL ? 'border-l' : 'border-r'} border-black`}>
          <p className={`text-sm font-bold mb-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
            {data.customer.name}
          </p>
          <p className={`text-[9px] text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
            {location}
          </p>
        </div>
        <div className="w-[150px] p-2">
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center mb-1`}>
            <span className="text-[9px]">✆</span>
            <span className="text-[8px] text-gray-700 mx-1">{labels.number1}:</span>
            <span className="text-[9px] font-bold" dir="ltr">{data.customer.phoneNumbers[0] || '-'}</span>
          </div>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center`}>
            <span className="text-[9px]">✆</span>
            <span className="text-[8px] text-gray-700 mx-1">{labels.number2}:</span>
            <span className="text-[9px] font-bold" dir="ltr">{data.customer.phoneNumbers[1] || '-'}</span>
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} border border-black mb-3`}>
        <div className="bg-black text-white py-2 px-3 font-bold text-[10px] w-[55px] text-center flex items-center justify-center">
          {labels.address}
        </div>
        <p className={`flex-1 p-2 text-[8px] ${isRTL ? 'text-right' : 'text-left'} leading-relaxed`}>
          {data.customer.address || '-'}
        </p>
      </div>

      {/* Order Barcode */}
      <div className="flex flex-col items-center my-3">
        <Barcode
          value={data.orderCode}
          width={1.5}
          height={45}
          fontSize={0}
          margin={0}
        />
        <span className="text-[11px] font-bold tracking-wider mt-1">{data.orderCode}</span>
      </div>

      {/* Packaging Notes Section */}
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} bg-black text-white`}>
        <span className="py-1.5 px-2 text-[9px] font-bold">{labels.packagingNotes}</span>
        <span className={`py-1.5 px-2 text-[9px] font-bold ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
          {labels.shipmentContents}:
        </span>
      </div>
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} border border-t-0 border-black mb-2`}>
        <div className={`flex-1 p-2 ${isRTL ? 'border-l' : 'border-r'} border-black`}>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-start`}>
            <span className="w-4 h-4 rounded-full bg-black text-white text-center text-[10px] font-bold leading-4 mx-1.5 flex-shrink-0">
              i
            </span>
            <p className={`text-[8px] ${isRTL ? 'text-right' : 'text-left'} leading-relaxed flex-1`}>
              {data.packagingNotes || labels.packagingWarning}
            </p>
          </div>
        </div>
        <div className="w-[160px] p-2">
          {data.products.map((product, index) => (
            <div
              key={index}
              className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between mb-0.5`}
            >
              <span className={`text-[8px] ${isRTL ? 'text-right' : 'text-left'}`}>
                {product.quantity || 1}x
              </span>
              <span className={`text-[8px] flex-1 ${isRTL ? 'text-right mr-2' : 'text-left ml-2'}`}>
                {formatProductName(product)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Notes Section */}
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} bg-black text-white`}>
        <span className="py-1.5 px-2 text-[9px] font-bold">{labels.shippingNotes}</span>
        <span className={`py-1.5 px-2 text-[9px] font-bold ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
          {labels.shippingInfo}
        </span>
      </div>
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} border border-t-0 border-black mb-2`}>
        <div className={`flex-1 p-2 ${isRTL ? 'border-l' : 'border-r'} border-black`}>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-start`}>
            <span className="w-4 h-4 rounded-full bg-black text-white text-center text-[10px] font-bold leading-4 mx-1.5 flex-shrink-0">
              i
            </span>
            <p className={`text-[8px] ${isRTL ? 'text-right' : 'text-left'} leading-relaxed flex-1`}>
              {data.shippingNotes || labels.packagingWarning}
            </p>
          </div>
        </div>
        <div className="w-[160px] p-2 space-y-1">
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
            <span className="text-[8px] text-gray-700">{labels.allowOpenShipment}</span>
            <span className="text-[8px] font-bold">
              {data.shipping.allowOpenShipment ? labels.yes : labels.no}
            </span>
          </div>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
            <span className="text-[8px] text-gray-700">{labels.paymentMethod} :</span>
            <span className="text-[8px] font-bold">{getPaymentMethodDisplay()}</span>
          </div>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
            <span className="text-[8px] text-gray-700">{labels.paymentStatus} :</span>
            <span className="text-[8px] font-bold">{getPaymentStatusDisplay()}</span>
          </div>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
            <span className="text-[8px] text-gray-700">{labels.shipmentStatus}</span>
            <span className="text-[8px] font-bold">{data.shipping.shipmentStatus || '-'}</span>
          </div>
        </div>
      </div>

      {/* Customer Schedule */}
      {timeDisplay && (
        <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} mb-2`}>
          <span className="bg-amber-500 py-1.5 px-2.5 font-bold text-[9px]">
            {labels.customerSchedule}:
          </span>
          <span className="flex-1 bg-amber-300 py-1.5 px-2.5 text-[10px] font-bold text-center">
            {timeDisplay}
          </span>
        </div>
      )}

      {/* Total Price */}
      <div className="bg-black py-3.5 px-4 mb-1.5">
        <p className="text-white text-xl font-bold text-center">
          {labels.totalPrice}: {data.totalPrice} EGP
        </p>
      </div>

      {/* Non-Receipt Penalty */}
      {typeof data.nonReceiptPenalty === 'number' && data.nonReceiptPenalty > 0 && (
        <p className="text-center text-[9px] font-bold mb-3">
          {labels.nonReceiptMessage} {data.nonReceiptPenalty} EGP.
        </p>
      )}

      {/* Shipping Barcode */}
      <div className="flex flex-col items-center my-3">
        <span className="font-bold text-[10px] mb-1">{labels.shippingBarcode}</span>
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
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between mt-2.5 pt-2 border-t border-gray-300`}>
        <div className="flex-1">
          <p className={`text-[8px] mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            {labels.contactMessage}
          </p>
          <p className={`text-[8px] mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <span className="font-bold">{labels.senderName}: </span>
            {storeName}
          </p>
          <p className={`text-[8px] mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <span className="font-bold">{labels.workNumbers}:</span>
          </p>
          <p className={`text-[8px] ${isRTL ? 'text-right' : 'text-left'}`}>
            ✆ {storeInfo.phoneNumbers[0] || ''} - ✆ {storeInfo.phoneNumbers[1] || ''}
          </p>
        </div>
        <div className="flex flex-col items-center w-20">
          <QRCodeSVG
            value={storeInfo.contactQRValue}
            size={60}
            level="L"
          />
          <span className="text-[7px] mt-1 text-center">{labels.scanToContact}</span>
        </div>
      </div>
    </div>
  );
}
