'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LiaWhatsapp,
  LiaCalendarAltSolid,
  LiaDollarSignSolid,
  LiaShoppingBagSolid,
  LiaUserSolid,
  LiaBanSolid,
  LiaEllipsisVSolid,
} from 'react-icons/lia';
import { LiaEnvelopeSolid } from 'react-icons/lia';
import { If, Then } from 'react-if';
import { getStatusColor } from '../lib/getBadgeColor';
import { getActivityColor } from '../lib/getActivityColor';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  /** Selection mode for the merge flow (T4) — تحديد toggle on the page header. */
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (customerId: number) => void;
}

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
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: CustomerCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { getStatusLabel } = useStatusLabel();

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
    <>
      <div
        onClick={() =>
          selectionMode ? onToggleSelect?.(customer.id) : onRowClick(customer.id)
        }
        className="bg-white rounded-2xl shadow-sm relative cursor-pointer hover:shadow-md transition-shadow"
        dir="rtl"
      >
        {/* Header Badge */}
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-2">
            {selectionMode && (
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect?.(customer.id)}
                />
              </div>
            )}
            <If condition={customer.isBlocked}>
              <Then>
                <div className="flex items-center gap-1 p-1 px-3 bg-[#f4e2e2] border-2 border-[#eed0d1] rounded-sm">
                  <LiaBanSolid size={18} className="text-[#dc0201]" />
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
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-start">
              <LiaUserSolid size={18} className="text-primary" />
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
                  <LiaWhatsapp className="w-5 h-5 text-primary hover:opacity-80" />
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
                  <LiaEnvelopeSolid size={18} className="text-primary" />
                  <span className="truncate font-medium text-sm">
                    {customer.email}
                  </span>
                </div>
              </Then>
            </If>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-start">
              <LiaShoppingBagSolid size={18} className="text-primary" />
              <span className="font-medium">
                عدد الطلبات:{' '}
                <span className="font-medium">{customer.numberOfOrders}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 justify-start">
              <LiaCalendarAltSolid size={18} className="text-primary" />
              <span className="font-medium">
                آخر طلب:{' '}
                <span className="font-medium">
                  {customer.latestOrder?.createdAt
                    ? new Date(
                      customer.latestOrder.createdAt
                    ).toLocaleDateString('en-GB')
                    : '-'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 justify-start">
              <LiaDollarSignSolid size={20} className="text-primary " />
              <span className="font-medium">{customer.totalAmount} جنيه</span>
            </div>
          </div>
        </div>

        <If condition={customer.isBlocked && customer.notes}>
          <Then>
            <div className="flex gap-1 w-fit mx-auto mb-2 items-center p-1 px-3 bg-[#ececec] rounded-sm font-semibold">
              <span className=" "> سبب الحظر:</span>
              {customer.notes}
            </div>
          </Then>
        </If>

        <hr className="border-gray-200" />

        {/* Footer: Status and Actions */}
        <div className="flex flex-row-reverse justify-between items-center px-4 py-3">
          <div ref={menuRef} className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <LiaEllipsisVSolid className="text-gray-500 w-5 h-5" />
            </Button>

            {isMenuOpen && (
              <div className="absolute left-[-10px] bottom-full mb-2 bg-white shadow-xl rounded-lg border z-20 min-w-[120px]">
                <Button
                  variant="ghost"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setShowBanModal(true);
                    setIsMenuOpen(false);
                  }}
                  disabled={isPending}
                  className={`w-full justify-start ${customer.isBlocked ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
                >
                  {customer.isBlocked ? 'إلغاء الحظر' : 'حظر'}
                </Button>
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
                ? getStatusLabel(customer.latestOrder.status)
                : '—'}
            </span>
          </div>
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <CustomerBanConfirmationModal
          id={customer.id.toString()}
          isOpen={showBanModal}
          onClose={() => setShowBanModal(false)}
          onConfirm={handleConfirmBan}
          customer={customer}
        />
      </div>
    </>
  );
}
