'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LiaPrintSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { Order, OrderFormat } from '@/types/orders';
import { InvoiceLanguage, InvoiceStoreInfo, InvoiceData } from '../../types/invoice';
import { mapOrdersToInvoices } from '../../utils/invoiceMapper';
import { Invoice } from '../Invoice';

interface PrintInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORE_INFO: InvoiceStoreInfo = {
  name: 'اوردرا',
  nameEn: 'Orderaa',
  phoneNumbers: ['01234567890', '01098765432'],
  contactQRValue: 'https://orderaa.com',
};

// TODO: Remove mock data after API is working
const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    code: 'ORD-2024-001',
    status: 'CONFIRMED',
    totalCost: 450,
    numberOfTriesToReach: 0,
    format: OrderFormat.APP,
    shippingId: 'SHP-001',
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    address: 'شارع مكرم عبيد، عمارة 15، الدور الثالث',
    paymentMethod: 'كاش',
    paymentStatus: 'الدفع عند الاستلام',
    packagingNotes: 'يرجى التغليف بعناية - منتج قابل للكسر',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    merchantId: 1,
    customerId: 1,
    customers: {
      id: 1,
      name: 'أحمد محمد علي',
      phone_numbers: ['01012345678', '01198765432'],
      address: 'شارع مكرم عبيد، عمارة 15، الدور الثالث',
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      totalCustomerOrders: 3,
    },
    order_products: [
      {
        id: 1,
        orderId: 1,
        productId: 1,
        quantity: 2,
        price: 150,
        variants: [
          { label: 'المقاس', value: '42' },
          { label: 'اللون', value: 'أسود' },
        ],
        products: {
          id: 1,
          name: 'حذاء رياضي Nike Air',
          price: 150,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
      {
        id: 2,
        orderId: 1,
        productId: 2,
        quantity: 1,
        price: 150,
        variants: [
          { label: 'المقاس', value: 'L' },
        ],
        products: {
          id: 2,
          name: 'تيشيرت قطن',
          price: 150,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
    ],
  },
  {
    id: 2,
    code: 'ORD-2024-002',
    status: 'CONFIRMED',
    totalCost: 799,
    numberOfTriesToReach: 1,
    format: OrderFormat.EASYORDER,
    shippingId: 'SHP-002',
    governorate: 'الاسكندرية',
    city: 'سموحة',
    address: 'شارع فوزي معاذ، برج النخيل، شقة 8',
    paymentMethod: 'فودافون كاش',
    paymentStatus: 'مدفوع',
    packagingNotes: 'طلب عاجل - التسليم قبل الساعة 6 مساءً',
    timeFrom: '14:00',
    timeTo: '18:00',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
    merchantId: 1,
    customerId: 2,
    customers: {
      id: 2,
      name: 'سارة أحمد حسن',
      phone_numbers: ['01234567890'],
      address: 'شارع فوزي معاذ، برج النخيل، شقة 8',
      governorate: 'الاسكندرية',
      city: 'سموحة',
      totalCustomerOrders: 1,
    },
    order_products: [
      {
        id: 3,
        orderId: 2,
        productId: 3,
        quantity: 1,
        price: 799,
        variants: [
          { label: 'المقاس', value: '40' },
          { label: 'اللون', value: 'أبيض' },
        ],
        products: {
          id: 3,
          name: 'حذاء Jordan الأصلي',
          price: 799,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
    ],
  },
];

export function PrintInvoicesModal({
  isOpen,
  onClose,
}: PrintInvoicesModalProps) {
  const [invoiceCount, setInvoiceCount] = useState<string>('');
  const [language, setLanguage] = useState<InvoiceLanguage>('ar');
  const [isPrinting, setIsPrinting] = useState(false);
  const [invoicesToPrint, setInvoicesToPrint] = useState<InvoiceData[]>([]);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const count = parseInt(invoiceCount, 10);
    if (count > 0) {
      setIsPrinting(true);
      const ordersToUse = MOCK_ORDERS.slice(0, count);
      const invoices = mapOrdersToInvoices(ordersToUse, language);
      setInvoicesToPrint(invoices);

      setTimeout(() => {
        window.print();
        setTimeout(() => {
          setIsPrinting(false);
          setInvoicesToPrint([]);
          toast.success('تم إنشاء الفاتورة بنجاح');
          handleReset();
          onClose();
        }, 500);
      }, 100);
    }
  };

  const handleReset = () => {
    setInvoiceCount('');
    setLanguage('ar');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="طباعة الفواتير"
        onConfirm={handlePrint}
        confirmText="طباعة"
        confirmIcon={<LiaPrintSolid className="size-5 text-white" />}
        confirmDisabled={!invoiceCount || parseInt(invoiceCount, 10) <= 0}
        isLoading={isPrinting}
        maxWidth="w-[500px]"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-start gap-3">
            <LiaPrintSolid className="size-10 text-primary" />
            <div>
              <p className="font-bold text-xl">طباعة الفواتير</p>
              <p className="text-gray-500 text-base">
                اختر عدد الطلبات المراد طباعتها من الطلبات المؤكدة
              </p>
            </div>
          </div>

          <Input
            label="عدد الطلبات للطباعة"
            type="number"
            min={1}
            value={invoiceCount}
            onChange={(e) => setInvoiceCount(e.target.value)}
            placeholder="عدد الفواتير للطباعة"
            disabled={isPrinting}
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">لغة الفاتورة</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="ar"
                  checked={language === 'ar'}
                  onChange={() => setLanguage('ar')}
                  disabled={isPrinting}
                  className="w-4 h-4 text-primary"
                />
                <span>عربي</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={language === 'en'}
                  onChange={() => setLanguage('en')}
                  disabled={isPrinting}
                  className="w-4 h-4 text-primary"
                />
                <span>English</span>
              </label>
            </div>
          </div>
        </div>
      </BaseModal>

      {isPrinting && typeof document !== 'undefined' && createPortal(
        <div ref={printContainerRef} className="print-container hidden print:block">
          {invoicesToPrint.map((invoice, index) => (
            <Invoice
              key={invoice.orderCode || index}
              data={invoice}
              storeInfo={STORE_INFO}
              language={language}
            />
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
