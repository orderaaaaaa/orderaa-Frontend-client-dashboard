'use client';

import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LiaPrintSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { InvoiceLanguage, InvoiceData } from '../../types/invoice';
import { mapOrdersToInvoices } from '../../utils/invoiceMapper';
import { Invoice } from '../Invoice';
import { printOrders } from '../../services/printOrders';
import { STORE_INFO } from '../../constants/invoiceLabels';
import {
  useBarcodeScanner,
  useScannerFeedback,
  useScannedOrders,
} from '../../hooks';
import { ScannedOrdersModal } from '../ScannedOrdersModal';

interface PrintInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrintInvoicesModal({
  isOpen,
  onClose,
}: PrintInvoicesModalProps) {
  const [invoiceCount, setInvoiceCount] = useState<string>('');
  const [language, setLanguage] = useState<InvoiceLanguage>('ar');
  const [isPrinting, setIsPrinting] = useState(false);
  const [invoicesToPrint, setInvoicesToPrint] = useState<InvoiceData[]>([]);
  const [isScannedOrdersModalOpen, setIsScannedOrdersModalOpen] =
    useState(false);
  const [flashingCode, setFlashingCode] = useState<string | null>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const { playSuccessSound, playErrorSound } = useScannerFeedback();
  const {
    scannedOrders,
    addOrder,
    removeOrder,
    clearOrders,
    searchQuery,
    setSearchQuery,
    filteredOrders,
  } = useScannedOrders();

  const handleScan = useCallback(
    (barcode: string) => {
      console.log('[PrintInvoicesModal] handleScan called with barcode:', barcode);
      console.log('[PrintInvoicesModal] isOpen:', isOpen);

      if (!isOpen) {
        console.log('[PrintInvoicesModal] Modal is closed, ignoring scan');
        return;
      }

      console.log('[PrintInvoicesModal] Attempting to add order to list');
      const added = addOrder(barcode);
      console.log('[PrintInvoicesModal] Order added result:', added);

      if (added) {
        console.log('[PrintInvoicesModal] Order added successfully, playing success sound');
        playSuccessSound();
        setFlashingCode(barcode);
        setTimeout(() => setFlashingCode(null), 600);

        console.log('[PrintInvoicesModal] isScannedOrdersModalOpen:', isScannedOrdersModalOpen);
        if (!isScannedOrdersModalOpen) {
          console.log('[PrintInvoicesModal] Opening ScannedOrdersModal');
          setIsScannedOrdersModalOpen(true);
        }
      } else {
        console.log('[PrintInvoicesModal] Order already exists, playing error sound');
        playErrorSound();
        toast.warning('هذا الطلب تم مسحه مسبقاً');
      }
    },
    [
      isOpen,
      addOrder,
      playSuccessSound,
      playErrorSound,
      isScannedOrdersModalOpen,
    ]
  );

  useBarcodeScanner({
    onScan: handleScan,
    enabled: isOpen,
  });

  const statusLabels: Record<string, string> = {
    PREPARED: 'تم التحضير',
    AWAITING_PACKAGING: 'فى انتظار التغليف',
    CALL_AGAIN: 'اعادة اتصال',
    CHANGE_PRODUCT: 'تغيير المنتج',
  };

  const handleStatusUpdate = (status: string) => {
    if (scannedOrders.length === 0) return;

    const statusLabel = statusLabels[status] || status;
    toast.info("جاري تحديث حالة الطلبات إلى: " + statusLabel);
    clearOrders();
    setIsScannedOrdersModalOpen(false);
  };

  const handlePrepared = () => handleStatusUpdate('PREPARED');
  const handleAwaitingPackaging = () => handleStatusUpdate('AWAITING_PACKAGING');
  const handleCallAgain = () => handleStatusUpdate('CALL_AGAIN');
  const handleChangeProduct = () => handleStatusUpdate('CHANGE_PRODUCT');

  const handlePrint = async () => {
    const count = parseInt(invoiceCount, 10);
    if (count > 0) {
      setIsPrinting(true);
      try {
        const response = await printOrders(count);
        const orders = response.orders;
        if (!orders || orders.length === 0) {
          toast.error('لا توجد طلبات متاحة للطباعة');
          setIsPrinting(false);
          return;
        }
        const invoices = mapOrdersToInvoices(orders, language);
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
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message;
        if (Array.isArray(errorMessage)) {
          toast.error(errorMessage[0]);
        } else if (typeof errorMessage === 'string') {
          toast.error(errorMessage);
        } else {
          toast.error('حدث خطأ أثناء جلب الطلبات');
        }
        setIsPrinting(false);
      }
    }
  };

  const handleReset = () => {
    setInvoiceCount('');
    setLanguage('ar');
  };

  const handleClose = () => {
    handleReset();
    clearOrders();
    setIsScannedOrdersModalOpen(false);
    onClose();
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen && !isScannedOrdersModalOpen}
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
          <div className="grid grid-cols-[auto_1fr] items-center gap-3">
            <LiaPrintSolid className="size-10 text-primary" />
            <div>
              <p className="font-bold text-xl">طباعة الفواتير</p>
              <p className="text-gray-500 text-base">
                أدخل عدد الطلبات المراد طباعتها من الطلبات المؤكدة
              </p>
            </div>
          </div>

          <Input
            label="عدد الطلبات للطباعة"
            type="number"
            min={1}
            value={invoiceCount}
            onChange={(e) => setInvoiceCount(e.target.value)}
            placeholder="أدخل عدد الطلبات"
            disabled={isPrinting}
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">لغة الفاتورة</p>
            <div className="grid grid-cols-2 gap-4">
              <label className="grid grid-cols-[auto_1fr] items-center gap-2 cursor-pointer">
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
              <label className="grid grid-cols-[auto_1fr] items-center gap-2 cursor-pointer">
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

      <ScannedOrdersModal
        isOpen={isScannedOrdersModalOpen}
        scannedOrders={scannedOrders}
        onRemoveOrder={removeOrder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredOrders={filteredOrders}
        onPrepared={handlePrepared}
        onAwaitingPackaging={handleAwaitingPackaging}
        onCallAgain={handleCallAgain}
        onChangeProduct={handleChangeProduct}
        isLoading={false}
        flashingCode={flashingCode}
      />

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
