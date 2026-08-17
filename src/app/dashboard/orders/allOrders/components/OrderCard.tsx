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
import { LiaClock, LiaPrintSolid, LiaBanSolid, LiaExclamationCircleSolid, LiaExchangeAltSolid, LiaUndoAltSolid, LiaRandomSolid } from 'react-icons/lia';
import { OrderCardProps } from '@/app/dashboard/orders/allOrders/types/OrderProps';
import { ShippingType } from '@/types/orders';
import { MdBlock } from 'react-icons/md';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { IconType } from 'react-icons';

const SHIPPING_TYPE_BADGE: Record<string, { label: string; icon: IconType; bg: string; text: string }> = {
  [ShippingType.EXCHANGE]: { label: 'استبدال', icon: LiaExchangeAltSolid, bg: 'bg-orange-100', text: 'text-orange-600' },
  [ShippingType.RETURN]: { label: 'مرتجع', icon: LiaUndoAltSolid, bg: 'bg-red-100', text: 'text-red-600' },
  [ShippingType.PARTIAL_RETURN]: { label: 'مرتجع جزئي', icon: LiaRandomSolid, bg: 'bg-amber-100', text: 'text-amber-600' },
};

export default function OrderCard({
  id,
  code,
  name,
  phoneNumbers,
  government,
  items,
  itemSkus,
  productVariants,
  price,
  shippingId,
  shippingCompany,
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
  collectedAmount,
  isCollected = false,
  isPartiallyPaid = false,
  isPrinted = false,
  printCount = 0,
  disableNavigation = false,
  hideCustomerInfo = false,
  showAllItems = false,
  shippingType,
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
      className={`relative w-full h-full max-w-full overflow-hidden bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.1)] rounded-[10px] transition-all duration-200 flex flex-col ${disableNavigation
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
      <div className="flex flex-col items-start px-6 gap-3 flex-grow min-w-0 w-full">
        {/* Code */}
        {code && code !== 'غير محدد' && (
          <div className="flex flex-row-reverse items-start gap-2 max-w-full">
            <span className="text-base font-medium text-black break-words min-w-0">{code}</span>
            <span className="text-base font-normal text-black flex-shrink-0">الكود :</span>
            <CiBarcode className="opacity-50 w-4 h-4 flex-shrink-0 mt-1" />
          </div>
        )}

        {/* Name + Alert + Time */}
        {!hideCustomerInfo && name && name !== 'غير محدد' && (
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-row-reverse items-start gap-2 min-w-0">
              <span className="text-base font-medium text-black break-words min-w-0">{name}</span>

              <User
                className="w-[18px] h-[18px] flex-shrink-0 mt-1"
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
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
                className="flex flex-row-reverse items-start gap-2 max-w-full"
              >
                <span className="text-base font-medium text-black break-words min-w-0" dir="ltr">
                  {phone}
                </span>
                <Phone
                  className="w-[18px] h-[18px] flex-shrink-0 mt-1"
                  style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
                />
              </div>
            ))}

        {/* Location */}
        {(government || city) && (
          <div className="flex flex-row-reverse items-start gap-2 max-w-full">
            <span className="text-base font-medium text-black break-words min-w-0">
              {[government, city]
                .filter((v) => v && v !== 'غير محدد')
                .join(' - ')}
            </span>
            <MapPin
              className="w-[18px] h-[18px] flex-shrink-0 mt-1"
              style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
            />
          </div>
        )}

        {/* Address */}
        {!hideCustomerInfo && (
          <div className="flex flex-row-reverse items-start gap-2 max-w-full">
            <span className="text-base font-medium text-black break-words min-w-0">{address}</span>
            <MapPinHouse
              className="w-[18px] h-[18px] flex-shrink-0 mt-1"
              style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
            />
          </div>
        )}

        {productVariants && productVariants.length > 0
          ? productVariants.map((pv, index) => (
              <div key={index} className="flex items-start gap-2 max-w-full">
                <Package
                  className="w-[18px] h-[18px] flex-shrink-0 mt-1"
                  style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
                />
                <span className="text-base font-medium text-black break-words min-w-0">
                  {pv.productName}
                  {/* Intentional: compact card shows attribute VALUE only (e.g. "XL"), not "name: value", to save horizontal space. Detail/PDF views show the full "name: value" form. */}
                  {pv.attributes.length > 0 && ` - ${pv.attributes.map((a) => a.value).join(' ')}`}
                  {pv.quantity ? ` × ${pv.quantity}` : ''}
                </span>
              </div>
            ))
          : items
            ? showAllItems
              ? items
                ?.filter((item) => item && item !== 'غير محدد')
                .map((item, index) => (
                  <div key={index} className="flex items-start gap-2 max-w-full">
                    <Package
                      className="w-[18px] h-[18px] flex-shrink-0 mt-1"
                      style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
                    />
                    <span className="text-base font-medium text-black break-words min-w-0">
                      {item}
                    </span>
                  </div>
                ))
              : items?.[0] &&
              items[0] !== 'غير محدد' && (
                <div className="flex items-start gap-2 max-w-full">
                  <Package
                    className="w-[18px] h-[18px] flex-shrink-0 mt-1"
                    style={{ strokeWidth: 1.5, color: 'rgba(0,0,0,0.5)' }}
                  />
                  <span className="text-base font-medium text-black break-words min-w-0">
                    {items[0]}
                  </span>
                </div>
              )
            : null}

        {productVariants && productVariants.length > 0
          ? productVariants.some((pv) => pv.sku) && (
              <div className="flex items-start gap-2 max-w-full">
                <CiBarcode
                  className="w-[18px] h-[18px] flex-shrink-0 mt-1"
                  style={{ color: 'rgba(0,0,0,0.5)' }}
                />
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <span className="text-sm font-semibold text-black">SKU:</span>
                  {productVariants.filter((pv) => pv.sku).map((pv, index) => (
                    <span key={index} className="text-sm font-medium text-black">
                      {pv.sku}
                    </span>
                  ))}
                </div>
              </div>
            )
          : itemSkus?.some(Boolean) && (
            <div className="flex items-start gap-2 max-w-full">
              <CiBarcode
                className="w-[18px] h-[18px] flex-shrink-0 mt-1"
                style={{ color: 'rgba(0,0,0,0.5)' }}
              />
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="text-sm font-semibold text-black">SKU:</span>
                {itemSkus.filter(Boolean).map((sku, index) => (
                  <span key={index} className="text-sm font-medium text-black">
                    {sku}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Price */}
        {price && (
          <div className="flex items-start gap-2 max-w-full">
            <Image
              src="/Icons/price.svg"
              alt="price"
              width={18}
              height={18}
              className="opacity-50"
            />
            <span className="text-base font-medium text-black">
              {price} جنيه
            </span>
            {/* T8. Absence is the common case and the card is already dense,
                so an uncollected order shows nothing at all. مدفوع جزئياً is
                visually distinct from محصل so staff keep chasing the balance. */}
            {isPartiallyPaid ? (
              <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                <LiaExclamationCircleSolid className="w-3.5 h-3.5" />
                مدفوع جزئياً{collectedAmount ? ` ${collectedAmount}` : ''}
              </span>
            ) : isCollected ? (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                محصل{collectedAmount ? ` ${collectedAmount} جنيه` : ''}
              </span>
            ) : null}
            {shippingType && SHIPPING_TYPE_BADGE[shippingType] && (() => {
              const badge = SHIPPING_TYPE_BADGE[shippingType];
              return (
                <span className={`flex items-center gap-1 ${badge.bg} ${badge.text} text-xs font-semibold px-2 py-0.5 rounded-full`}>
                  <badge.icon className="w-3.5 h-3.5" />
                  {badge.label}
                </span>
              );
            })()}
          </div>
        )}


        {/* Shipping */}
        {shippingId && (
          <div className="flex flex-row items-center gap-2 max-w-full flex-wrap">
            <Truck className="opacity-30 flex-shrink-0" height={18} />
            <span className="text-base font-medium text-black break-words min-w-0">
              {shippingId}
            </span>
            {shippingCompany && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full break-words">
                {shippingCompany}
              </span>
            )}
          </div>
        )}

        {postponedUntil && (
          <div className="flex flex-row-reverse items-start gap-2 text-amber-400 max-w-full">
            <p className="text-base font-medium break-words min-w-0">
              مواجل: {getRemainingTime(postponedUntil)}
            </p>
            <LiaClock className="w-5 h-5 flex-shrink-0 mt-1" />
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
                <span className="text-base font-medium text-red-600 break-words min-w-0">
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
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200"
              title="تمت الطباعة"
            >
              <LiaPrintSolid className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">تمت الطباعة</span>
            </div>
            {printCount > 1 && (
              <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                {printCount}x
              </span>
            )}
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
