'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  User,
  Package,
  DollarSign,
} from 'lucide-react';
import { TfiMore } from 'react-icons/tfi';
import { GoDotFill } from 'react-icons/go';
import { If, Then } from 'react-if';
import { getStatusColor } from '../lib/getBadgeColor';
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

  return (
    <div
      onClick={() => onRowClick(customer.id)}
      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm relative cursor-pointer hover:shadow-md transition-shadow"
      dir="rtl"
    >
      {/* Header Icons */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <div className="p-2 bg-[#f1eefa] rounded-lg text-[#5D24E1]">
            <Package size={20} />
          </div>
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <span className="text-xl">💎</span>
          </div>
        </div>
        <div className="w-6 h-6 border-2 border-[#5D24E1] rounded-md" />{' '}
        {/* Checkbox placeholder */}
      </div>

      <hr className="border-gray-50 mb-4" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-y-4 text-right">
        {/* Right Column: Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-start">
            <User size={18} className="text-gray-400" />
            <div className="flex items-center gap-1">
              <If condition={customer.isBlocked}>
                <Then>
                  <GoDotFill className="text-[#f61515]" />
                </Then>
              </If>
              <span className="font-bold text-gray-800">{customer.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-start">
            <Phone size={18} className="text-gray-400" />
            <span className="text-gray-600">{phone || '—'}</span>
          </div>
          <div className="flex items-center gap-2 justify-start overflow-hidden">
            <Mail size={18} className="text-gray-400" />
            <span className="text-gray-600 truncate text-sm">
              {customer.email || '—'}
            </span>
          </div>
        </div>

        {/* Left Column: Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-start">
            <Package size={18} className="text-gray-400" />
            <span className="text-gray-700">
              عدد الطلبات:{' '}
              <span className="font-bold">{customer.numberOfOrders}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 justify-start">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-gray-700">
              اخر طلب:{' '}
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
            <div className="p-1 bg-gray-100 rounded text-gray-500">
              <DollarSign size={14} />
            </div>
            <span className="text-gray-700 font-bold">
              {customer.totalAmount} جنيه
            </span>
          </div>
        </div>
      </div>

      <hr className="border-gray-50 my-4" />

      {/* Footer: Status and Actions */}
      <div className="flex justify-between items-center">
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <TfiMore className="text-gray-500" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 bg-white shadow-xl rounded-lg border z-20 min-w-[120px]">
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
