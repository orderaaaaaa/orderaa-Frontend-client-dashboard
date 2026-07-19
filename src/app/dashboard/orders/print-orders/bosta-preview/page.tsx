'use client';

import { BostaInvoice } from '../components/BostaInvoice';
import { InvoiceData, InvoiceStoreInfo } from '../types/invoice';

const mockData: InvoiceData = {
  orderCode: '58374407',
  shippingId: '58374407',
  shippingCompany: 'BOSTA',
  customer: {
    name: 'عمر أمين',
    governorate: 'القاهرة',
    city: 'البساتين',
    phoneNumbers: ['+201102971573'],
    address:
      '٦ ش محمد عبد العزيز متفرع من شارع ابو الوفا بجوار مسجد الاخلاص - دار السلام - القاهرة, القاهره',
  },
  area: 'دار السلام',
  products: [
    {
      name: 'Patek Philippe Leather Strap',
      quantity: 1,
      attributes: [{ id: 0, name: 'Color', value: 'White / Black' }],
    },
  ],
  shipping: {
    allowOpenShipment: true,
    paymentMethod: 'COD',
    paymentStatus: 'unpaid',
    shipmentStatus: 'COD',
  },
  schedule: {},
  totalPrice: 879,
  nonReceiptPenalty: 65,
  returnShippingCost: 65,
  canOpenShipment: true,
  merchantName: 'Lucere watches',
  merchantGovernorate: 'الشرقيه',
  merchantCity: 'العاشر من رمضان',
  shippingNotes: null,
  createdAt: '2026-03-25T00:00:00.000Z',
};

const mockStoreInfo: InvoiceStoreInfo = {
  name: 'Lucere watches',
  nameEn: 'Lucere watches',
  phoneNumbers: ['+201000000000'],
  contactQRValue: 'https://orderaa.com',
  defaultReturnShippingCost: 65,
  canOpenShipment: true,
};

export default function BostaPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <BostaInvoice data={mockData} storeInfo={mockStoreInfo} language="ar" />
    </div>
  );
}
