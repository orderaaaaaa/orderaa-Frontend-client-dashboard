'use client';

import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid } from 'react-icons/lia';
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
    <DialogPrimitive.Root
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-[100] -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[24px] shadow-2xl flex flex-col max-h-[85vh] mx-4">
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <div className="text-right">
              <DialogPrimitive.Title className="text-2xl font-bold">
                اضافة Lead جديد
              </DialogPrimitive.Title>
              <p className="text-gray-400 mt-1">ادخل معلومات العميل الجديد</p>
            </div>
            <DialogPrimitive.Close>
              <LiaTimesSolid className="w-6 h-6 cursor-pointer" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="sr-only">
            إضافة عميل محتمل جديد
          </DialogPrimitive.Description>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
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

            <div className="space-y-2">
              <label className="font-medium text-right block">مصدر الليد</label>
              <SearchableSelect
                options={sourceOptions}
                value={formData.leadSource}
                onValueChange={(v) => setFormData({ ...formData, leadSource: v })}
                triggerClassName="h-14 bg-gray-50 border-none rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium text-right block">حالة الليد</label>
              <StatusSelect
                value={formData.leadStatus}
                onChange={(v) => setFormData({ ...formData, leadStatus: v })}
              />
            </div>
          </div>

          <div className="p-6 flex justify-end gap-3 flex-shrink-0">
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
