'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Package,
  MapPin,
  Phone,
  User,
  MapPinHouse,
  TriangleAlert,
  Ban,
  FileText,
  Truck,
} from 'lucide-react';
import { CiBarcode } from 'react-icons/ci';
import { getTimeAgo } from '@/utils/timeAgo';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { If, Then } from 'react-if';

interface OrderCardProps {
  id: number;
  code: string;
  name: string;
  phoneNumbers: string[];
  government: string;
  items: string[];
  price: number;
  trys: number;
  status: string;
  city: string;
  address: string;
  alert: number;
  select: boolean;
  isSelected?: boolean;
  shippingId?: string;
  onSelectionChange?: (checked: boolean) => void;
  createdAt?: string;
  repeatCount?: number;
  onRepeatClick?: () => void;
  filterParams?: string;
  cancelReason?: string | null;
  cancelNotes?: string | null;
}

export default function OrderCard({
  id,
  code,
  name,
  phoneNumbers,
  government,
  items,
  price,
  shippingId,
  trys,
  status,
  city,
  address,
  select,
  isSelected = false,
  onSelectionChange,
  createdAt,
  repeatCount = 0,
  onRepeatClick,
  filterParams,
  cancelReason,
  cancelNotes,
}: OrderCardProps) {
  const router = useRouter();
  const { getStatusLabel } = useStatusLabel();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectionChange?.(e.target.checked);
  };

  const handleCardClick = () => {
    const url = filterParams
      ? `/dashboard/orders/${id}?${filterParams}`
      : `/dashboard/orders/${id}`;
    router.push(url);
  };

  const handleRepeatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRepeatClick?.();
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative w-full h-full md:max-w-[300px] bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.1)] rounded-[10px] cursor-pointer hover:shadow-[0px_6px_20px_rgba(93,36,225,0.15)] transition-all duration-200 flex flex-col"
    >
      {/* Checkbox – top right */}
      <div className="flex justify-start mb-1 px-4 pt-3">
        {select && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 border-2 border-[#5D24E1] rounded-[4px] cursor-pointer accent-[#5D24E1]"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col items-start px-6 gap-3 flex-grow">
        {/* Code */}
        {code && code !== 'غير محدد' && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">{code}</span>
            <span className="text-base font-normal text-black">الكود :</span>
            <CiBarcode className="opacity-50 w-4 h-4" />
          </div>
        )}

        {/* Name + Alert + Time */}
        {name && name !== 'غير محدد' && (
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-row-reverse items-center gap-2">
              <span className="text-base font-medium text-black">{name}</span>
              <User
                className="w-[18px] h-[18px]"
                style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
              />
            </div>

            <div
              className={`flex absolute left-8  flex-col-reverse items-center gap-3
                ${select ? 'top-10' : 'top-5'}
                `}
            >
              {repeatCount > 1 && (
                <button
                  onClick={handleRepeatClick}
                  className="relative hover:scale-110 transition-transform"
                  title="عرض جميع طلبات العميل"
                >
                  <TriangleAlert
                    className="w-6 h-6 text-red-600 cursor-pointer"
                    style={{ strokeWidth: 1.5 }}
                  />
                  <span className="absolute top-3 right-[-4px] w-4 h-4 text-[11px] font-bold bg-white text-red-600 rounded-full flex items-center justify-center">
                    {repeatCount}
                  </span>
                </button>
              )}

              <span className="text-xs text-[#5D24E1] whitespace-nowrap">
                {getTimeAgo(createdAt)}
              </span>
            </div>
          </div>
        )}

        {/* Phones */}
        {phoneNumbers
          .filter((p) => p && p !== 'غير محدد')
          .map((phone, index) => (
            <div
              key={index}
              className="flex flex-row-reverse items-center gap-2"
            >
              <span className="text-base font-medium text-black" dir="ltr">
                {phone}
              </span>
              <Phone
                className="w-[18px] h-[18px]"
                style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
              />
            </div>
          ))}

        {/* Location */}
        {(government || city) && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">
              {[government, city]
                .filter((v) => v && v !== 'غير محدد')
                .join(' - ')}
            </span>
            <MapPin
              className="w-[18px] h-[18px]"
              style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
            />
          </div>
        )}

        {/* Address */}
        <div className="flex flex-row-reverse items-center gap-2">
          <span className="text-sm text-gray-600">{address}</span>
          <MapPinHouse
            className="w-[18px] h-[18px]"
            style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
          />
        </div>

        {/* Items */}
        {items?.[0] && items[0] !== 'غير محدد' && (
          <div className="flex items-center gap-2">
            <Package
              className="w-[18px] h-[18px]"
              style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
            />
            <span className="text-base font-medium text-black">{items[0]}</span>
          </div>
        )}

        {/* Price */}
        {price && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">
              {price} جنيه
            </span>
            <Image
              src="/Icons/price.svg"
              alt="price"
              width={18}
              height={18}
              className="opacity-50"
            />
          </div>
        )}

        {/* Shipping */}
        {shippingId && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">
              {shippingId}
            </span>
            <Truck className="opacity-30" height={18} />
          </div>
        )}

        {/* Cancel Info */}
        {status === 'CANCELLED' && (cancelReason || cancelNotes) && (
          <div className="flex flex-col gap-3 w-full">
            {cancelReason && (
              <div className="flex items-start gap-2">
                <Ban
                  className="w-[18px] h-[18px]"
                  style={{ strokeWidth: 1.5, color: 'rgba(220,38,38,0.7)' }}
                />
                <span className="text-base font-medium text-red-600">
                  سبب الالغاء: {cancelReason}
                </span>
              </div>
            )}
            {cancelNotes && (
              <div className="flex items-start gap-2">
                <FileText
                  className="w-[18px] h-[18px]"
                  style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
                />
                <span className="text-base text-gray-600">
                  {' '}
                  ملاحظات الالغاء: {cancelNotes}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mx-6 mt-5 mb-3 border-t border-black/10" />

      <div className="flex flex-row-reverse justify-between items-center px-6 pb-4">
        <div className="flex items-center gap-2">
          <Image
            src="/Icons/shipping.svg"
            alt="shipping"
            width={20}
            height={20}
          />
          <span className="text-xs font-medium text-[#5D24E1]">
            {getStatusLabel(status)}
          </span>
        </div>

        <If condition={trys > 0}>
          <Then>
            <div className="flex items-center gap-2">
              <Image
                src="/Icons/repeat.svg"
                alt="tries"
                width={20}
                height={20}
              />
              <span className="text-xs font-medium text-[#5D24E1]">
                المحاولات:
              </span>
              <span className="text-xs font-medium text-[#5D24E1]">{trys}</span>
            </div>
          </Then>
        </If>
      </div>
    </div>
  );
}
