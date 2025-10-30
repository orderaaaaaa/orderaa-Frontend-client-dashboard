import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Package, MapPin, Phone, User } from "lucide-react";

interface OrderCardProps {
  id: number;
  code: string;
  name: string;
  phone: string;
  altPhone?: string;
  government: string;
  items: string[];
  price: number;
  trys: number;
  status: string;
  city: string;
  alert: number;
  select: boolean;
  isSelected?: boolean;
  onSelectionChange?: (checked: boolean) => void;
  createdAt?: string;
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'قيد الانتظار',
    'CONFIRMED': 'مؤكد',
    'SHIPPING': 'في الشحن',
    'DELIVERED': 'تم التسليم',
    'CANCELLED': 'ملغي',
    'RETURNED': 'مرتجع',
  };
  return statusMap[status] || status;
};

const getTimeAgo = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : 'ايام'}${diffHours > 0 ? ` و ${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}` : ''}`;
  } else if (diffHours > 0) {
    return `منذ ${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `منذ ${diffMinutes} ${diffMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
  }
};

export default function OrderCard({
  id,
  code,
  name,
  phone,
  altPhone,
  government,
  items,
  price,
  trys,
  status,
  city,
  alert,
  select,
  isSelected = false,
  onSelectionChange,
  createdAt,
}: OrderCardProps) {
  const router = useRouter();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      onSelectionChange(e.target.checked);
    }
  };

  const handleCardClick = () => {
    router.push(`/dashboard/orders/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative w-[400px] bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.1)] rounded-[10px] border-2 border-[#5D24E1] cursor-pointer hover:shadow-[0px_6px_20px_rgba(93,36,225,0.15)] transition-all duration-200 flex flex-col"
    >
      <div className="flex flex-row justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
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

        <span className="text-xs font-normal text-[#5D24E1] tracking-tight">
          {getTimeAgo(createdAt)}
        </span>
      </div>

      <div className="flex flex-col items-start px-6 gap-3 flex-grow" >
        {code && code !== 'غير محدد' && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">{code}</span>
            <span className="text-base font-normal text-black">:الكود</span>
            <Image src="/Icons/id.svg" alt="code" width={18} height={18} className="flex-shrink-0 opacity-50" />
          </div>
        )}

        {name && name !== 'غير محدد' && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">{name}</span>
            <User className="w-[18px] h-[18px] flex-shrink-0" style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }} />
          </div>
        )}

        {(government && government !== 'غير محدد') || (city && city !== 'غير محدد') ? (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">
              {government && government !== 'غير محدد' ? government : ''}{government && government !== 'غير محدد' && city && city !== 'غير محدد' ? ' - ' : ''}{city && city !== 'غير محدد' ? city : ''}
            </span>
            <MapPin className="w-[18px] h-[18px] flex-shrink-0" style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }} />
          </div>
        ) : null}

        {phone && phone !== 'غير محدد' && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black" dir="ltr">{phone}</span>
            <Phone className="w-[18px] h-[18px] flex-shrink-0" style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }} />
          </div>
        )}

        {altPhone && altPhone !== 'غير محدد' && altPhone !== phone && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black" dir="ltr">{altPhone}</span>
            <Phone className="w-[18px] h-[18px] flex-shrink-0" style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }} />
          </div>
        )}

        {items && items[0] && items[0] !== 'غير محدد' && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">{items[0]}</span>
            <Package className="w-[18px] h-[18px] flex-shrink-0" style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }} />
          </div>
        )}

        {price && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">{price} جنيه</span>
            <Image src="/Icons/price.svg" alt="price" width={18} height={18} className="flex-shrink-0 opacity-50" />
          </div>
        )}
      </div>

      <div className="mx-6 mt-5 mb-3 border-t border-[rgba(0,0,0,0.08)]"></div>

      <div className="flex flex-row-reverse justify-between items-center px-6 pb-4">
        <div className="flex flex-row items-center gap-2">
          <Image src="/Icons/shipping.svg" alt="shipping" width={20} height={20} />
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
