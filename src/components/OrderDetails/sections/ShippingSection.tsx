import React from 'react';
import { LiaTruckSolid, LiaMapMarkerAltSolid, LiaEditSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { PERMISSION_CODES } from '@/lib/permissions';

export interface ShippingSectionProps {
  shippingCompany?: string;
  governorate?: string;
  city?: string;
  address?: string;
  onEditClick: () => void;
  className?: string;
  externalGovernorate?: string | null;
  externalCity?: string | null;
  sourceGovernorate?: string | null;
  sourceCity?: string | null;
}

interface ShippingFieldProps {
  label: string;
  value?: string | null;
  sourceValue?: string | null;
  icon: React.ReactNode;
  className?: string;
  multiline?: boolean;
}

function ShippingField({ label, value, sourceValue, icon, className = '', multiline = false }: ShippingFieldProps) {
  const isEmpty = !value;
  const displayValue = isEmpty ? '-' : value;

  return (
    <div className={`flex flex-col gap-1 min-w-0 overflow-hidden ${className}`}>
      <p className="font-bold text-[#121212]">{label}</p>
      <div className={`flex gap-2 bg-white shadow-xs ${multiline ? 'items-start' : 'items-center'} py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000] ${multiline ? 'min-h-[60px]' : ''}`}>
        <span className={multiline ? 'mt-1 flex-shrink-0' : 'flex-shrink-0'}>{icon}</span>
        <p className={`${isEmpty ? 'text-red-500' : ''} whitespace-pre-wrap break-words flex-1 min-w-0`}>
          {displayValue}
        </p>
      </div>
      {sourceValue && (
        <p className="text-xs text-gray-400">
          الاسم الأصلي المخزّن:{' '}
          <span className="font-medium text-gray-500">{sourceValue}</span>
        </p>
      )}
    </div>
  );
}

export function ShippingSection({
  shippingCompany,
  governorate,
  city,
  address,
  onEditClick,
  className = '',
  externalGovernorate,
  externalCity,
  sourceGovernorate,
  sourceCity,
}: ShippingSectionProps) {
  return (
    <div className={`flex flex-col justify-start gap-2 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-primary font-semibold">بيانات الشحن</h2>
        <Can code={PERMISSION_CODES.ORDERS_UPDATE}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onEditClick}
            className="p-1 hover:bg-purple-100 rounded"
          >
            <LiaEditSolid className="w-4 h-4 text-primary" />
          </Button>
        </Can>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
        <ShippingField
          label="الشركة"
          value={shippingCompany}
          icon={<LiaTruckSolid size={18} />}
        />

        <ShippingField
          label="المحافظة"
          value={governorate || externalGovernorate}
          sourceValue={sourceGovernorate}
          icon={<LiaMapMarkerAltSolid size={18} />}
        />

        <ShippingField
          label="المنطقة"
          value={city || externalCity}
          sourceValue={sourceCity}
          icon={<LiaMapMarkerAltSolid size={18} />}
        />

        <ShippingField
          label="العنوان بالتفصيل"
          value={address}
          icon={<LiaMapMarkerAltSolid size={18} />}
          className="md:col-span-4"
          multiline
        />
      </div>
    </div>
  );
}
