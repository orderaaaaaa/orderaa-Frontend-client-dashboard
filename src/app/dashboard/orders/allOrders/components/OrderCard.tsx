import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Package,
  MapPin,
  Phone,
  User,
  MapPinHouse,
  TriangleAlert,
  FileText,
  Truck,
} from 'lucide-react';
import { CiBarcode } from 'react-icons/ci';
import { getTimeAgo } from '@/utils/timeAgo';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { If, Then } from 'react-if';
import { getStatusBadgeConfig } from '@/lib/status-badges';
import { getRemainingTime } from '@/utils/getRemainingTime';
import { LiaClock, LiaPrintSolid, LiaBanSolid, LiaExclamationCircleSolid } from 'react-icons/lia';
import { OrderCardProps } from '@/app/dashboard/orders/allOrders/types/OrderProps';
import { MdBlock } from 'react-icons/md';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';

export default function OrderCard({
  id,
  code,
  name,
  phoneNumbers,
  government,
  items,
  price,
  shippingId,
  isBlocked,
  customerNotes,
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
  postponedUntil,
  isPrinted = false,
  disableNavigation = false,
  hideCustomerInfo = false,
  showAllItems = false,
  states,
}: OrderCardProps) {
  const router = useRouter();
  const { getStatusLabel } = useStatusLabel();
  const { classes, Icon } = getStatusBadgeConfig(status);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectionChange?.(e.target.checked);
  };

  const handleCardClick = () => {
    if (disableNavigation) return;
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
      className={`relative w-full h-full max-w-[90%] md:max-w-[300px] bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.1)] rounded-[10px] transition-all duration-200 flex flex-col ${disableNavigation
          ? ''
          : 'cursor-pointer hover:shadow-[0px_6px_20px_rgba(93,36,225,0.15)]'
        }`}
    >
      {/* Checkbox – top right */}
      <div className="flex justify-start mb-1 px-4 pt-3">
        {select && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 border-2 border-primary rounded-[4px] cursor-pointer accent-primary"
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
        {!hideCustomerInfo && name && name !== 'غير محدد' && (
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-row-reverse items-center gap-2">
              <span className="text-base font-medium text-black">{name}</span>

              <User
                className="w-[18px] h-[18px]"
                style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
              />
            </div>

            <div
              className={`flex absolute left-5 flex-col-reverse items-center gap-3
                ${select ? 'top-10' : 'top-5'}
                `}
            >
              {repeatCount > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleRepeatClick}
                  className="relative hover:scale-110 transition-transform p-0 h-auto"
                  title="عرض جميع طلبات العميل"
                >
                  <TriangleAlert
                    className="w-6 h-6 text-red-600 cursor-pointer"
                    style={{ strokeWidth: 1.5 }}
                  />
                  <span className="absolute top-3 right-[-4px] w-4 h-4 text-[11px] font-bold bg-white text-red-600 rounded-full flex items-center justify-center">
                    {repeatCount}
                  </span>
                </Button>
              )}

              <span className="text-xs text-primary whitespace-nowrap">
                {getTimeAgo(createdAt)}
              </span>
              <If condition={isBlocked}>
                <Then>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNotesModalOpen(true);
                    }}
                    className="flex items-center gap-1 p-1 px-3 h-auto bg-[#f4e2e2] border-2 border-[#eed0d1] rounded-sm hover:bg-[#f0d4d4] transition-colors"
                  >
                    <MdBlock size={18} className="text-[#dc0201]" />
                    <span className="text-[#dc0201] text-xs">محظور</span>
                  </Button>
                </Then>
              </If>
            </div>
          </div>
        )}

        {/* Phones */}
        {!hideCustomerInfo &&
          phoneNumbers
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
        {!hideCustomerInfo && (
          <div className="flex flex-row-reverse items-center gap-2">
            <span className="text-base font-medium text-black">{address}</span>
            <MapPinHouse
              className="w-[18px] h-[18px]"
              style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
            />
          </div>
        )}

        {showAllItems
          ? items
            ?.filter((item) => item && item !== 'غير محدد')
            .map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Package
                  className="w-[18px] h-[18px]"
                  style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
                />
                <span className="text-base font-medium text-black">
                  {item}
                </span>
              </div>
            ))
          : items?.[0] &&
          items[0] !== 'غير محدد' && (
            <div className="flex items-center gap-2">
              <Package
                className="w-[18px] h-[18px]"
                style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
              />
              <span className="text-base font-medium text-black">
                {items[0]}
              </span>
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

        {postponedUntil && (
          <div className="flex flex-row-reverse items-center gap-2 text-amber-400 ">
            <p className="text-base font-medium ">
              مواجل: {getRemainingTime(postponedUntil)}
            </p>
            <LiaClock className="w-5 h-5" />
          </div>
        )}

        {states && states.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {states.filter((state) => !state.note?.startsWith('Cancelled')).map((state, index) => (
              <div key={index} className="flex items-start gap-2">
                <FileText
                  className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
                  style={{ strokeWidth: 1.5, color: 'rgba(220,38,38,0.7)' }}
                />
                <span className="text-base font-medium text-red-600">
                  {state.note}
                </span>
              </div>
            ))}
          </div>
        )}

        {status === 'CANCELLED' && cancelReason && (
          <div className="flex items-center gap-2 w-full">
            <LiaExclamationCircleSolid
              className="w-[18px] h-[18px] shrink-0 opacity-30"
            />
            <span className="text-base font-medium text-red-600 min-w-0 overflow-hidden text-ellipsis line-clamp-3 break-words">
              سبب الالغاء: {cancelReason}
            </span>
          </div>
        )}

        {status === 'CANCELLED' && cancelNotes && (
          <div className="flex items-center gap-2 w-full">
            <LiaBanSolid
              className="w-[18px] h-[18px] shrink-0 opacity-30"
            />
            <span className="text-base font-medium text-red-600 min-w-0 overflow-hidden text-ellipsis line-clamp-3 break-words">
              ملاحظات الالغاء: {cancelNotes}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mx-6 mt-5 mb-3 border-t border-black/10" />

      <div className="flex flex-row-reverse justify-between items-center px-6 pb-4">
        {isPrinted ? (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium"
            title="تمت الطباعة"
          >
            <LiaPrintSolid className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium">تمت الطباعة</span>
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${classes}`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">
              {getStatusLabel(status)}
            </span>
          </div>
        )}

        <If condition={trys > 0}>
          <Then>
            <div className="flex items-center gap-2">
              <Image
                src="/Icons/repeat.svg"
                alt="tries"
                width={20}
                height={20}
              />
              <span className="text-xs font-medium text-primary">
                المحاولات:
              </span>
              <span className="text-xs font-medium text-primary">{trys}</span>
            </div>
          </Then>
        </If>
      </div>
      <BaseModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        title="ملاحظات العميل"
        showFooter={false}
      >
        <div className="flex flex-col gap-3">
          {customerNotes && (Array.isArray(customerNotes) ? customerNotes.length > 0 : customerNotes.trim().length > 0) ? (
            Array.isArray(customerNotes) ? (
              customerNotes.map((note, index) => (
                <p key={index} className="text-base text-[#1F1F1F] whitespace-pre-wrap">{note}</p>
              ))
            ) : (
              <p className="text-base text-[#1F1F1F] whitespace-pre-wrap">{customerNotes}</p>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <MdBlock size={40} className="text-gray-300" />
              <p className="text-base text-gray-400">لا توجد ملاحظات لهذا العميل</p>
            </div>
          )}
        </div>
      </BaseModal>
    </div>
  );
}
