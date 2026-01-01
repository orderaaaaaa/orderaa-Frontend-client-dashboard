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
import { getTimeAgo } from '@/utils/timeAgo';

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

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    NEW_ORDER: 'طلب جديد',
    STOPPED: 'وقف التشغيل',
    CALL_AGAIN: 'إعادة اتصال',
    POSTPONED: 'مؤجل',
    REGISTERED: 'منتسب',
    WAITING_FOR_PAYMENT: 'في انتظار الدفع',
    ATTEMPTED: 'تم المحاولة',
    CONFIRMED: 'مؤكد',
    PREPARED: 'تم التحضير',
    RETURNED_DELIVERED: 'مرتجع مسلم',
    REPORTS: 'تقرير',
    SHIPPING: 'في الشحن',
    DELIVERED: 'تم التسليم',
    MISSING: 'مفقود',
    PARTIAL_DELIVERY: 'تسليم جزئى',
    CANCELLED: 'ملغي',
  };
  return statusMap[status] || status;
};

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
  alert,
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      onSelectionChange(e.target.checked);
    }
  };

  const handleCardClick = () => {
    const url = filterParams
      ? `/dashboard/orders/${id}?${filterParams}`
      : `/dashboard/orders/${id}`;
    router.push(url);
  };

  const handleRepeatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRepeatClick) {
      onRepeatClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative w-full h-full md:max-w-[300px] bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.1)] rounded-[10px] cursor-pointer hover:shadow-[0px_6px_20px_rgba(93,36,225,0.15)] transition-all duration-200 flex flex-col"
    >
      <div className="grid grid-cols-3 items-center py-2 gap-4">
        {/* Right: Checkbox */}
        <div className="flex relative left-5 justify-center">
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

        {/* Center: Empty space */}
        <div />

        {/* Left: Repeat icon and created at */}
        <div className="flex flex-col justify-center items-center gap-2">
          {repeatCount > 1 && (
            <button
              onClick={handleRepeatClick}
              className="absolute top-7 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              title="عرض جميع طلبات العميل"
            >
              <TriangleAlert
                className="w-8 h-8 text-red-600"
                style={{ strokeWidth: 1.5 }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white text-red-600 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-[15px] font-bold">{repeatCount}</span>
              </div>
            </button>
          )}
          <span className="text-xs font-normal text-[#5D24E1] tracking-tight text-center">
            {getTimeAgo(createdAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start px-6 gap-3 flex-grow">
        {code && code !== 'غير محدد' && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">{code}</span>
            <span className="text-base font-normal text-black">الكود :</span>
            <Image
              src="/Icons/id.svg"
              alt="code"
              width={18}
              height={18}
              className="flex-shrink-0 opacity-50"
            />
          </div>
        )}

        {name && name !== 'غير محدد' && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">{name}</span>
            <User
              className="w-[18px] h-[18px] flex-shrink-0"
              style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
            />
          </div>
        )}

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
                className="w-[18px] h-[18px] flex-shrink-0"
                style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
              />
            </div>
          ))}

        {(government && government !== 'غير محدد') ||
        (city && city !== 'غير محدد') ? (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">
              {government && government !== 'غير محدد' ? government : ''}
              {government &&
              government !== 'غير محدد' &&
              city &&
              city !== 'غير محدد'
                ? ' - '
                : ''}
              {city && city !== 'غير محدد' ? city : ''}
            </span>
            <MapPin
              className="w-[18px] h-[18px] flex-shrink-0"
              style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
            />
          </div>
        ) : null}

        {/* full address */}
        <div className="flex flex-row-reverse items-center gap-2">
          <span className="text-sm font-normal text-gray-600">{address}</span>
          <MapPinHouse
            className="w-[18px] h-[18px] flex-shrink-0"
            style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
          />
        </div>

        {items && items[0] && items[0] !== 'غير محدد' && (
          <div className="flex flex-row items-center gap-2 w-full">
            <Package
              className="w-[18px] h-[18px] flex-shrink-0"
              style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
            />
            <div className="flex flex-row-reverse flex-wrap gap-1">
              <span className="text-base font-medium text-black text-right">
                {items[0]}
              </span>
            </div>
          </div>
        )}

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
              className="flex-shrink-0 opacity-50"
            />
          </div>
        )}

        {shippingId && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">
              {shippingId}
            </span>
            <Truck height={18} className="flex-shrink-0 opacity-30" />
          </div>
        )}

        {status === 'CANCELLED' && (cancelReason || cancelNotes) && (
          <div className="flex flex-col gap-3 w-full">
            {cancelReason && (
              <div className="flex items-start gap-2">
                <Ban
                  className="w-[18px] h-[18px] flex-shrink-0"
                  style={{ strokeWidth: 1.5, color: 'rgba(220,38,38,0.7)' }}
                />
                <span className="text-base font-medium text-red-600">
                  {cancelReason}
                </span>
              </div>
            )}
            {cancelNotes && (
              <div className="flex items-start gap-2">
                <FileText
                  className="w-[18px] h-[18px] flex-shrink-0"
                  style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
                />
                <span className="text-base font-medium text-gray-600">
                  {cancelNotes}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mx-6 mt-5 mb-3 border-t border-[rgba(0,0,0,0.08)]"></div>

      <div className="flex flex-row-reverse justify-between items-center px-6 pb-4">
        <div className="flex flex-row items-center gap-2">
          <Image
            src="/Icons/shipping.svg"
            alt="shipping"
            width={20}
            height={20}
          />
          <span className="text-xs font-medium text-[#5D24E1]">
            {getStatusText(status)}
          </span>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Image src="/Icons/repeat.svg" alt="tries" width={20} height={20} />
          <span className="text-xs font-medium text-[#5D24E1]">المحاولات:</span>
          <span className="text-xs font-medium text-[#5D24E1]">{trys}</span>
        </div>
      </div>
    </div>
  );
}
