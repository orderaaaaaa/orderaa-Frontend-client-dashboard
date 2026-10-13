'use client';

import React, { useState } from 'react';
import {
  LiaWhatsapp,
  LiaCalendarAltSolid,
  LiaMoneyBillWaveSolid,
  LiaShoppingBagSolid,
  LiaUserSolid,
  LiaBanSolid,
  LiaEnvelopeSolid,
} from 'react-icons/lia';
import { getStatusColor } from '../lib/getBadgeColor';
import { formatAmount } from '../lib/formatAmount';
import {
  blockReasonOf,
  formatOrderDate,
  isActivationKey,
  toWhatsAppNumber,
} from '../lib/contact';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { Checkbox } from '@/components/ui/checkbox';
import CustomerBanConfirmationModal from './modals/CustomerBanConfirmationModal';
import { CustomerBadgeChip } from './CustomerBadgeChip';
import { CustomerActionsMenu } from './CustomerActionsMenu';
import { Customer } from '../types/customer';

interface CustomerCardProps {
  customer: Customer;
  onToggleBlock: (
    customerId: number,
    currentBlockStatus: boolean,
    note?: string
  ) => void;
  isPending: boolean;
  onRowClick: (customer: Customer) => void;
  /** Selection mode for the merge flow (T4) — تحديد toggle on the page header. */
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (customer: Customer) => void;
}

export function CustomerCard({
  customer,
  onToggleBlock,
  isPending,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: CustomerCardProps) {
  const [showBanModal, setShowBanModal] = useState(false);
  const blockReason = blockReasonOf(customer);
  const { getStatusLabel } = useStatusLabel();

  const handleConfirmBan = (_id: string, note: string) => {
    onToggleBlock(customer.id, customer.isBlocked, note);
    setShowBanModal(false);
  };

  const activate = () =>
    selectionMode ? onToggleSelect?.(customer) : onRowClick(customer);

  const phone = customer.phoneNumbers[0];
  const whatsappNumber = phone ? toWhatsAppNumber(phone) : null;

  return (
    <>
      <div
        onClick={activate}
        onKeyDown={(event) => {
          if (!isActivationKey(event)) return;
          event.preventDefault();
          activate();
        }}
        tabIndex={0}
        role="group"
        aria-label={
          selectionMode ? `تحديد ${customer.name}` : `تفاصيل ${customer.name}`
        }
        className={`bg-white rounded-2xl shadow-sm relative cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          isSelected ? 'ring-2 ring-primary/60' : ''
        }`}
        dir="rtl"
      >
        <div className="flex flex-wrap justify-between items-center gap-2 px-4 py-3 min-h-[56px]">
          <div className="flex items-center gap-2">
            {selectionMode && (
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect?.(customer)}
                  aria-label={`تحديد ${customer.name}`}
                />
              </div>
            )}
            {customer.isBlocked && (
              <div className="flex items-center gap-1 p-1 px-3 bg-[#f4e2e2] border-2 border-[#eed0d1] rounded-sm">
                <LiaBanSolid size={18} className="text-[#dc0201]" aria-hidden />
                <span className="text-[#dc0201] text-sm">محظور</span>
              </div>
            )}
          </div>
          <CustomerBadgeChip badge={customer.badge} />
        </div>

        <hr className="border-gray-200" />

        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-x-4 gap-y-3 text-right px-4 py-4">
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <LiaUserSolid size={18} className="text-primary shrink-0" aria-hidden />
              <span className="font-medium break-words min-w-0">{customer.name}</span>
            </div>

            {phone && (
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`واتساب ${phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="size-10 -m-2.5 flex items-center justify-center shrink-0"
                >
                  <LiaWhatsapp className="w-5 h-5 text-primary hover:opacity-80" />
                </a>
                <a
                  href={`tel:${phone}`}
                  dir="ltr"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline font-medium"
                >
                  {phone}
                </a>
              </div>
            )}

            {customer.email && (
              <div className="flex items-center gap-2 overflow-hidden">
                <LiaEnvelopeSolid size={18} className="text-primary shrink-0" aria-hidden />
                <span dir="ltr" className="truncate font-medium text-sm">
                  {customer.email}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-2">
              <LiaShoppingBagSolid size={18} className="text-primary shrink-0" aria-hidden />
              <span className="font-medium">
                عدد الطلبات: <span className="font-medium">{customer.numberOfOrders}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LiaCalendarAltSolid size={18} className="text-primary shrink-0" aria-hidden />
              <span className="font-medium">
                آخر طلب:{' '}
                <span className="font-medium">
                  {formatOrderDate(customer.latestOrder?.createdAt)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LiaMoneyBillWaveSolid size={20} className="text-primary shrink-0" aria-hidden />
              <span className="font-medium">{formatAmount(customer.totalAmount)}</span>
            </div>
          </div>
        </div>

        {blockReason && (
          <div className="flex flex-wrap gap-1 mx-4 mb-3 items-center p-1 px-3 bg-[#ececec] rounded-sm font-semibold break-words">
            <span>سبب الحظر:</span>
            <span className="font-normal">{blockReason}</span>
          </div>
        )}

        <hr className="border-gray-200" />

        <div className="flex justify-between items-center gap-2 px-4 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-gray-500 font-bold shrink-0">الحالة:</span>
            <span
              className={`px-4 py-1 rounded-full font-medium text-sm truncate ${getStatusColor(
                customer.latestOrder?.status
              )}`}
            >
              {customer.latestOrder
                ? getStatusLabel(customer.latestOrder.status)
                : '—'}
            </span>
          </div>
          <CustomerActionsMenu
            customerName={customer.name}
            isBlocked={customer.isBlocked}
            isPending={isPending}
            onToggleBlockRequest={() => setShowBanModal(true)}
          />
        </div>
      </div>

      <CustomerBanConfirmationModal
        id={customer.id.toString()}
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleConfirmBan}
        customer={customer}
      />
    </>
  );
}
