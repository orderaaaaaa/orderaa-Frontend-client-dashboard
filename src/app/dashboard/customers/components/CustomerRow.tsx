'use client';
import React, { memo, useEffect, useRef, useState } from 'react';
import { LiaShoppingBagSolid, LiaWhatsapp, LiaCalendarAltSolid, LiaEllipsisVSolid } from 'react-icons/lia';
import { LiaEnvelopeSolid, LiaCircleSolid } from 'react-icons/lia';
import { If, Then } from 'react-if';
import { getStatusColor } from '../lib/getBadgeColor';
import { getActivityColor } from '../lib/getActivityColor';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { Button } from '@/components/ui/button';
import CustomerBanConfirmationModal from './modals/CustomerBanConfirmationModal';
import { useEditCustomer } from '../hooks/useEditCustomer';
import { toast } from 'react-toastify';

interface CustomerRowProps {
  customer: any;
  onToggleBlock: (
    customerId: number,
    currentBlockStatus: boolean,
    note?: string
  ) => void;
  isPending: boolean;
  onRowClick: (customerId: number) => void;
  showNotesColumn: boolean;
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
  isPending,
  onRowClick,
  showNotesColumn,
}: CustomerRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { getStatusLabel } = useStatusLabel();

  // Hook handles the mutation and notifications
  const { mutate: editCustomer, isPending: isUpdating } = useEditCustomer({
    onSuccess: (data, variables) => {
      if (variables.payload.isBlocked) {
        toast.success('تم الحظر بنجاح');
      } else {
        toast.success('تم إلغاء الحظر بنجاح');
      }
    },
    onError: () => {},
  });

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
    editCustomer({
      customerId: customer.id,
      payload: {
        isBlocked: !customer.isBlocked,
        notes: note,
      },
    });
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
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <If condition={customer.isBlocked}>
              <Then>
                <LiaCircleSolid className="text-[#f61515] w-5 h-5" />
              </Then>
            </If>
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
                  onClick={(e) => e.stopPropagation()}
                >
                  <LiaWhatsapp className="w-5 h-5 text-primary hover:opacity-80" />
                </a>
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
                  <LiaEnvelopeSolid className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{customer.email}</span>
                </div>
              </Then>
            </If>
          </div>
        </td>

        <td className="px-4 py-4 text-center whitespace-nowrap">
          <div className="inline-flex items-center gap-2">
            <LiaShoppingBagSolid className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-lg">
              {customer.numberOfOrders}
            </span>
          </div>
        </td>

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
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${getActivityColor(
              'Loyal Buyer'
            )}`}
          >
            <span>🏆</span>
            <span>Loyal Buyer</span>
          </span>
        </td>

        <td className="px-4 py-4 text-center whitespace-nowrap">
          <span className="font-medium">{customer.totalAmount} جنية</span>
        </td>

        {showNotesColumn && (
          <td className="px-4 py-4 text-center whitespace-nowrap">
            <span className="font-medium text-gray-600">
              {customer.isBlocked ? customer.notes || '—' : '—'}
            </span>
          </td>
        )}

        <td
          className="px-4 py-4 text-center whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <div ref={menuRef} className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <LiaEllipsisVSolid className="w-5 h-5 text-gray-600" />
            </Button>
            {isMenuOpen && (
              <div className="absolute left-0 mt-1 bg-white rounded-lg shadow-lg border z-10 min-w-[140px]">
                <Button
                  variant="ghost"
                  onClick={handleBanClick}
                  disabled={isPending || isUpdating}
                  className={`w-full justify-start ${customer.isBlocked ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
                >
                  {isPending || isUpdating
                    ? 'جاري...'
                    : customer.isBlocked
                      ? 'إلغاء الحظر'
                      : 'حظر'}
                </Button>
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
