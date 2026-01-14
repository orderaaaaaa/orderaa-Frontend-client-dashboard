'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import Input from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/button';
import { StatusSelect } from '../ui/StatusSelect';

export default function AddLeadModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    clientName: '',
    mobileNumber: '',
    leadSource: 'social_media',
    leadStatus: 'hotLeads' as string,
  });

  const sourceOptions = [
    {
      key: 'social_media',
      label: 'إعلانات السوشيال ميديا',
      value: 'إعلانات السوشيال ميديا',
    },
    {
      key: 'website',
      label: 'الموقع الإلكتروني',
      value: 'الموقع الإلكتروني',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="text-right">
            <h2 className="text-2xl font-bold">اضافة Lead جديد</h2>
            <p className="text-gray-400 mt-1">ادخل معلومات العميل الجديد</p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-visible">
          <Input
            label="اسم الليد"
            value={formData.clientName}
            onChange={(e) =>
              setFormData({ ...formData, clientName: e.target.value })
            }
            inputClassName="h-14 bg-gray-50 border-none text-right"
          />

          <Input
            label="رقم الموبايل"
            value={formData.mobileNumber}
            onChange={(e) =>
              setFormData({ ...formData, mobileNumber: e.target.value })
            }
            inputClassName="h-14 bg-gray-50 border-none text-right"
          />

          {/* مصدر الليد – SearchableSelect */}
          <div className="space-y-2">
            <label className="font-medium text-right block">مصدر الليد</label>
            <SearchableSelect
              options={sourceOptions}
              value={formData.leadSource}
              onValueChange={(v) => setFormData({ ...formData, leadSource: v })}
              triggerClassName="h-14 bg-gray-50 border-none rounded-xl"
            />
          </div>

          {/* حالة الليد – Custom colored select */}
          <div className="space-y-2">
            <label className="font-medium text-right block">حالة الليد</label>
            <StatusSelect
              value={formData.leadStatus}
              onChange={(v) => setFormData({ ...formData, leadStatus: v })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex justify-end gap-3 ">
          <Button className="bg-primary text-white text-base rounded-sm px-10 py-5">
            إضافة
          </Button>
          <Button
            variant="outline"
            className="text-base rounded-sm px-10 py-5"
            onClick={onClose}
          >
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}
