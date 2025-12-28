'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { TfiMore } from 'react-icons/tfi';
import {
  LiaWhatsapp,
  LiaCalendarAltSolid,
  LiaDollarSignSolid,
} from 'react-icons/lia';
import { GoMail } from 'react-icons/go';
import { MdBlock } from 'react-icons/md';
import { User } from 'lucide-react';
import { If, Then } from 'react-if';
import { getStatusColor } from '../lib/getBadgeColor';
import { getActivityColor } from '../lib/getActivityColor';
import { ORDER_STATUS_AR } from '../lib/orderStatusAr';
import CustomerBanConfirmationModal from './modals/CustomerBanConfirmationModal';

interface CustomerCardProps {
  customer: any;
  onToggleBlock: (
    customerId: number,
    currentBlockStatus: boolean,
    note?: string
  ) => void;
  isPending: boolean;
  onRowClick: (customerId: number) => void;
}

// Helper for WhatsApp link matching CustomerRow.tsx
const toWhatsAppNumber = (phone: string) => {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('0')) {
    return `+20${cleaned.slice(1)}`;
  }
  return cleaned;
};

export function CustomerCard({
  customer,
  onToggleBlock,
  isPending,
  onRowClick,
}: CustomerCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const handleConfirmBan = (id: string, note: string) => {
    onToggleBlock(customer.id, customer.isBlocked, note);
    setShowBanModal(false);
  };

  const phone = customer.phoneNumbers?.[0];
  const whatsappNumber = phone ? toWhatsAppNumber(phone) : null;

  return (
    <div
      onClick={() => onRowClick(customer.id)}
      className="bg-white rounded-2xl shadow-sm relative cursor-pointer hover:shadow-md transition-shadow"
      dir="rtl"
    >
      {/* Header Badge */}
      <div className="flex justify-between items-center px-4 py-3">
        <div>
          <If condition={customer.isBlocked}>
            <Then>
              <div className="flex items-center gap-1 p-1 px-3 bg-[#f4e2e2] border-2 border-[#eed0d1] rounded-sm">
                <MdBlock size={18} className="text-[#dc0201]" />
                <span className="text-[#dc0201] text-sm"> محظور</span>
              </div>
            </Then>
          </If>
        </div>
        <span
          className={`inline-flex items-end gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${getActivityColor(
            'Loyal Buyer'
          )}`}
        >
          <span>🏆</span>
          <span>Loyal Buyer</span>
        </span>
      </div>

      <hr className="border-gray-200 mb-4" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-right px-4 py-4">
        {/* Right Column: Contact Info (Mirroring Row Logic) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-start">
            <User size={18} className="text-[#5D24E1] " />
            <span className="font-medium">{customer.name}</span>
          </div>

          {phone && (
            <div className="flex items-center gap-2 justify-start">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <LiaWhatsapp className="w-5 h-5 text-[#5D24E1] hover:opacity-80" />
              </a>
              <a
                href={`tel:${phone}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline font-medium"
              >
                {phone}
              </a>
            </div>
          )}

          <If condition={customer.email}>
            <Then>
              <div className="flex items-center gap-2 justify-start overflow-hidden">
                <GoMail size={18} className="text-[#5D24E1]" />
                <span className="truncate font-medium text-sm">
                  {customer.email}
                </span>
              </div>
            </Then>
          </If>
        </div>

        {/* Left Column: Stats (Using Row Icons) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-start">
            <ShoppingBag size={18} className="text-[#5D24E1] " />
            <span className="font-medium">
              عدد الطلبات:{' '}
              <span className="font-medium">{customer.numberOfOrders}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 justify-start">
            <LiaCalendarAltSolid size={18} className="text-[#5D24E1]" />
            <span className="font-medium">
              آخر طلب:{' '}
              <span className="font-bold">
                {customer.latestOrder?.createdAt
                  ? new Date(customer.latestOrder.createdAt).toLocaleDateString(
                      'en-GB'
                    )
                  : '-'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 justify-start">
            <LiaDollarSignSolid size={20} className="text-[#5D24E1] " />
            <span className="font-medium">{customer.totalAmount} جنيه</span>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Footer: Status and Actions */}
      <div className="flex flex-row-reverse justify-between items-center px-4 py-3">
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <TfiMore className="text-gray-500 w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute left-[-10px] bottom-full mb-2 bg-white shadow-xl rounded-lg border z-20 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBanModal(true);
                  setIsMenuOpen(false);
                }}
                disabled={isPending}
                className={`w-full px-4 py-2 text-right transition-colors hover:bg-gray-50 ${
                  customer.isBlocked ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {customer.isBlocked ? 'إلغاء الحظر' : 'حظر'}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-bold">الحالة :</span>
          <span
            className={`px-6 py-1 rounded-full font-medium ${getStatusColor(
              customer.latestOrder?.status
            )}`}
          >
            {customer.latestOrder
              ? ORDER_STATUS_AR[
                  customer.latestOrder.status as keyof typeof ORDER_STATUS_AR
                ]
              : '—'}
          </span>
        </div>
      </div>

      <CustomerBanConfirmationModal
        id={customer.id.toString()}
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleConfirmBan}
        customer={customer}
      />
    </div>
  );
}
