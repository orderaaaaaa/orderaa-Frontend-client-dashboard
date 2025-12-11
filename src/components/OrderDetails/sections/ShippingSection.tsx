import React from 'react';
import { LiaTruckSolid, LiaMapMarkerAltSolid, LiaEditSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';

export interface ShippingSectionProps {
  shippingCompany?: string;
  governorate?: string;
  city?: string;
  address?: string;
  onEditClick: () => void;
  className?: string;
}


export function ShippingSection({
  shippingCompany,
  governorate,
  city,
  address,
  onEditClick,
  className = '',
}: ShippingSectionProps) {
  return (
    <div className={`bg-white pt-2 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#5D24E1] font-bold text-lg">بيانات الشحن</h2>
        <Button
          variant="ghost"
          onClick={onEditClick}
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#5D24E1] rounded-lg hover:bg-purple-50 transition-colors font-bold"
        >
          <LiaEditSolid className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
        {/* Shipping Company */}
        <div className="flex flex-col gap-1">
          <p className="font-bold text-[#121212]">الشركة</p>
          <div className="flex gap-2 bg-gray-50 shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]">
            <LiaTruckSolid size={18} />
            <p className={!shippingCompany ? 'text-red-500' : ''}>
              {shippingCompany || '-'}
            </p>
          </div>
        </div>

        {/* Governorate */}
        <div className="flex flex-col gap-1">
          <p className="font-bold text-[#121212]">المحافظة</p>
          <div className="flex gap-2 bg-gray-50 shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]">
            <LiaMapMarkerAltSolid size={18} />
            <p className={!governorate ? 'text-red-500' : ''}>{governorate || '-'}</p>
          </div>
        </div>

        {/* City */}
        <div className="flex flex-col gap-1">
          <p className="font-bold text-[#121212]">المنطقة</p>
          <div className="flex gap-2 bg-gray-50 shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]">
            <LiaMapMarkerAltSolid size={18} />
            <p className={!city ? 'text-red-500' : ''}>{city || '-'}</p>
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1 md:col-span-4">
          <p className="font-bold text-[#121212]">العنوان بالتفصيل</p>
          <div className="flex gap-2 bg-gray-50 shadow-xs items-start py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000] min-h-[60px]">
            <LiaMapMarkerAltSolid size={18} className="mt-1" />
            <p className={!address ? 'text-red-500' : ''}>{address || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
