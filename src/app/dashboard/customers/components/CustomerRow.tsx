'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { TfiMore } from 'react-icons/tfi';
import { LiaWhatsapp, LiaCalendarAltSolid } from 'react-icons/lia';
import { GoMail, GoDotFill } from 'react-icons/go';
import { If, Then } from 'react-if';

import { getStatusColor } from '../lib/getBadgeColor';
import { getActivityColor } from '../lib/getActivityColor';
import { ORDER_STATUS_AR } from '../lib/orderStatusAr';

import CustomerBanConfirmationModal from './modals/CustomerBanConfirmationModal';

interface CustomerRowProps {
  customer: any;
  onToggleBlock: (
    customerId: number,
    currentBlockStatus: boolean,
    note?: string
  ) => void;
  isPending: boolean;
  onRowClick: (customerId: number) => void;
}

const toWhatsAppNumber = (phone: string) => {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('0')) {
    return `+20${cleaned.slice(1)}`;
  }
  return cleaned;
};

export const CustomerRow = memo(function CustomerRow({
  customer,
  onToggleBlock,
  isPending,
  onRowClick,
}: CustomerRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleBanClick = () => {
    setIsMenuOpen(false);
    setShowBanModal(true);
  };

  const handleConfirmBan = (id: string, note: string) => {
    onToggleBlock(customer.id, customer.isBlocked, note);
    setShowBanModal(false);
  };
  const phone = customer.phoneNumbers?.[0];
  const whatsappNumber = phone ? toWhatsAppNumber(phone) : null;

  return (
    <>
      <tr
        onClick={() => onRowClick(customer.id)}
        className="hover:bg-gray-50 transition-colors cursor-pointer"
      >
        {/* العميل */}
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <If condition={customer.isBlocked}>
              <Then>
                <GoDotFill className="text-[#f61515] w-5 h-5" />
              </Then>
            </If>
            <span className="font-semibold text-gray-900">{customer.name}</span>
          </div>
        </td>

        {/* التواصل */}
        <td className="px-4 py-4">
          <div className="flex flex-col gap-2 min-w-[180px]">
            {phone && (
              <div className="flex items-center gap-2">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LiaWhatsapp className="w-5 h-5 text-[#5D24E1] hover:opacity-80" />
                </a>

                {/* Phone Call */}
                <a
                  href={`tel:${phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium hover:underline"
                >
                  {phone}
                </a>
              </div>
            )}

            <If condition={customer.email}>
              <Then>
                <div className="flex items-center gap-2">
                  <GoMail className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{customer.email}</span>
                </div>
              </Then>
            </If>
          </div>
        </td>

        {/* عدد الطلبات */}
        <td className="px-4 py-4 text-center whitespace-nowrap">
          <div className="inline-flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-lg">
              {customer.numberOfOrders}
            </span>
          </div>
        </td>

        {/* اخر طلب */}
        <td className="px-4 py-4 text-center whitespace-nowrap">
          <div className="inline-flex items-center gap-2">
            <LiaCalendarAltSolid className="w-5 h-5 text-gray-500" />
            <span className="font-medium">
              {customer.latestOrder?.createdAt
                ? new Date(customer.latestOrder.createdAt).toLocaleDateString(
                    'en-GB'
                  )
                : '-'}
            </span>
          </div>
        </td>

        {/* الحالة */}
        <td className="px-4 py-4 text-center whitespace-nowrap">
          <span
            className={`px-5 py-1 text-sm font-medium rounded-full ${getStatusColor(
              customer.latestOrder?.status
            )}`}
          >
            {customer.latestOrder
              ? ORDER_STATUS_AR[
                  customer.latestOrder.status as keyof typeof ORDER_STATUS_AR
                ]
              : '—'}
          </span>
        </td>

        {/* النشاط */}
        <td className="px-4 py-4 text-center whitespace-nowrap">
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${getActivityColor(
              'Loyal Buyer'
            )}`}
          >
            <span>🏆</span>
            <span>Loyal Buyer</span>
          </span>
        </td>

        {/* الإجمالي */}
        <td className="px-4 py-4 text-center whitespace-nowrap">
          <span className="font-medium">{customer.totalAmount} جنية</span>
        </td>

        {/* الإجراءات */}
        <td
          className="px-4 py-4 text-center whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <TfiMore className="w-5 h-5 text-gray-600" />
            </button>

            {isMenuOpen && (
              <div className="absolute left-0 mt-1 bg-white rounded-lg shadow-lg border z-10 min-w-[140px]">
                <button
                  onClick={handleBanClick}
                  disabled={isPending}
                  className={`w-full px-6 py-2 transition-colors hover:bg-gray-50 cursor-pointer ${
                    customer.isBlocked ? 'text-green-600' : 'text-red-600'
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isPending
                    ? 'جاري...'
                    : customer.isBlocked
                    ? 'إلغاء الحظر'
                    : 'حظر'}
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      <CustomerBanConfirmationModal
        id={customer.id.toString()}
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleConfirmBan}
        customer={customer}
      />
    </>
  );
});
