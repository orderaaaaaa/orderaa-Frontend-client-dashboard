'use client';
import React, { memo, useState } from 'react';
import {
  LiaShoppingBagSolid,
  LiaWhatsapp,
  LiaCalendarAltSolid,
  LiaEnvelopeSolid,
  LiaCircleSolid,
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

interface CustomerRowProps {
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

export const CustomerRow = memo(function CustomerRow({
  customer,
  onToggleBlock,
  isPending,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: CustomerRowProps) {
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
      <tr
        onClick={activate}
        onKeyDown={(event) => {
          if (!isActivationKey(event)) return;
          event.preventDefault();
          activate();
        }}
        tabIndex={0}
        className="hover:bg-gray-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
      >
        {selectionMode && (
          <td
            className="px-4 py-4 whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect?.(customer)}
              aria-label={`تحديد ${customer.name}`}
            />
          </td>
        )}
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center gap-1">
            {customer.isBlocked && (
              <LiaCircleSolid
                className="text-[#f61515] w-5 h-5"
                aria-label="محظور"
              />
            )}
            <span className="font-semibold text-gray-900">{customer.name}</span>
          </div>
        </td>

        <td className="px-4 py-4">
          <div className="flex flex-col gap-2 min-w-[180px]">
            {phone && (
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`واتساب ${phone}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <LiaWhatsapp className="w-5 h-5 text-primary hover:opacity-80" />
                </a>
                <a
                  href={`tel:${phone}`}
                  dir="ltr"
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium hover:underline"
                >
                  {phone}
                </a>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2">
                <LiaEnvelopeSolid className="w-5 h-5 text-gray-600" aria-hidden />
                <span dir="ltr" className="font-medium">
                  {customer.email}
                </span>
              </div>
            )}
          </div>
        </td>

        <td className="px-4 py-4 text-center whitespace-nowrap">
          <div className="inline-flex items-center gap-2">
            <LiaShoppingBagSolid className="w-5 h-5 text-gray-500" aria-hidden />
            <span className="font-medium text-lg">{customer.numberOfOrders}</span>
          </div>
        </td>

        <td className="px-4 py-4 text-center whitespace-nowrap">
          <div className="inline-flex items-center gap-2">
            <LiaCalendarAltSolid className="w-5 h-5 text-gray-500" aria-hidden />
            <span className="font-medium">
              {formatOrderDate(customer.latestOrder?.createdAt)}
            </span>
          </div>
        </td>

        <td className="px-4 py-4 text-center whitespace-nowrap">
          <span
            className={`px-5 py-1 text-sm font-medium rounded-full ${getStatusColor(
              customer.latestOrder?.status
            )}`}
          >
            {customer.latestOrder
              ? getStatusLabel(customer.latestOrder.status)
              : '—'}
          </span>
        </td>

        <td className="px-4 py-4 text-center whitespace-nowrap">
          {customer.badge ? (
            <CustomerBadgeChip badge={customer.badge} />
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>

        <td className="px-4 py-4 text-center whitespace-nowrap">
          <span className="font-medium">{formatAmount(customer.totalAmount)}</span>
        </td>

        <td className="px-4 py-4 text-center w-48 max-w-48">
          {blockReason ? (
            <span
              className="block truncate font-medium text-gray-600"
              title={blockReason}
            >
              {blockReason}
            </span>
          ) : (
            <span className="block font-medium text-gray-600">—</span>
          )}
        </td>

        <td
          className="px-4 py-4 text-center whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <CustomerActionsMenu
            customerName={customer.name}
            isBlocked={customer.isBlocked}
            isPending={isPending}
            onToggleBlockRequest={() => setShowBanModal(true)}
          />
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
