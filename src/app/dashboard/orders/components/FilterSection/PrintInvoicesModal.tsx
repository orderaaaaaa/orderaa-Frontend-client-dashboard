'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { LiaPrintSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { InvoiceData } from '../../print-orders/types/invoice';
import { mapOrdersToInvoices } from '../../print-orders/utils/invoiceMapper';
import { Invoice } from '../../print-orders/components/Invoice';
import { printOrders } from '../../print-orders/services/printOrders';
import { useInvoiceSettings } from '../../print-orders/hooks/useInvoiceSettings';

interface PrintInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrintInvoicesModal({
  isOpen,
  onClose,
}: PrintInvoicesModalProps) {
  const queryClient = useQueryClient();
  const [invoiceCount, setInvoiceCount] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [invoicesToPrint, setInvoicesToPrint] = useState<InvoiceData[]>([]);
  const { storeInfo, language } = useInvoiceSettings();

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
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRINT_ORDER_STATISTICS] });
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
        </div>
      </BaseModal>

      {isPrinting &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="print-container hidden print:block">
            {invoicesToPrint.map((invoice, index) => (
              <Invoice
                key={invoice.orderCode || index}
                data={invoice}
                storeInfo={storeInfo}
                language={language}
              />
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
