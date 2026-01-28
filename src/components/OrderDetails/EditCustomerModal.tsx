import React, { useState, useEffect, useMemo } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid, LiaCheckSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerData: {
    id: number;
    name: string;
    phoneNumber: string;
    altPhone?: string;
    governorate?: string;
    city?: string;
    address?: string;
  };
  onSave: (updatedData: any) => Promise<void>;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customerData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: customerData.name || '',
    phoneNumber: customerData.phoneNumber || '',
    altPhone: customerData.altPhone || '',
    governorate: customerData.governorate || '',
    city: customerData.city || '',
    address: customerData.address || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: customerData.name || '',
        phoneNumber: customerData.phoneNumber || '',
        altPhone: customerData.altPhone || '',
        governorate: customerData.governorate || '',
        city: customerData.city || '',
        address: customerData.address || '',
      });
    }
  }, [isOpen, customerData]);

  const hasChanges = useMemo(() => {
    return (
      formData.name !== (customerData.name || '') ||
      formData.phoneNumber !== (customerData.phoneNumber || '') ||
      formData.altPhone !== (customerData.altPhone || '') ||
      formData.governorate !== (customerData.governorate || '') ||
      formData.city !== (customerData.city || '') ||
      formData.address !== (customerData.address || '')
    );
  }, [formData, customerData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success('تم تحديث بيانات العميل بنجاح');
      onClose();
    } catch (error) {
      toast.error('فشل في تحديث بيانات العميل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[20px] shadow-lg w-[95vw] sm:w-[90vw] md:w-[827px] max-w-[827px] max-h-[85vh] overflow-auto"
          onPointerDownOutside={(e) => {
            if (isSubmitting) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isSubmitting) e.preventDefault();
          }}
        >
          <div
            className="h-[60px] rounded-t-[20px] flex items-center justify-between px-6"
            style={{
              background: 'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
            }}
          >
            <DialogPrimitive.Close
              className="text-black hover:text-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              <LiaTimesSolid className="w-6 h-6 cursor-pointer" />
            </DialogPrimitive.Close>
            <DialogPrimitive.Title className="font-bold text-center flex-1 text-xl text-black">
              تعديل البيانات الشخصية
            </DialogPrimitive.Title>
            <div className="w-6"></div>
          </div>

          <DialogPrimitive.Description className="sr-only">
            تعديل بيانات العميل الشخصية
          </DialogPrimitive.Description>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <label className="block mb-3 font-bold text-lg text-black text-right">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="محمد بدر مصطفى"
                  className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex-1">
                <label className="block mb-3 font-bold text-lg text-black text-right">
                  رقم الهاتف الأول
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="01127454951"
                  className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <label className="block mb-3 font-bold text-lg text-black text-right">
                  رقم الهاتف الثاني
                </label>
                <input
                  type="text"
                  name="altPhone"
                  value={formData.altPhone}
                  onChange={handleInputChange}
                  placeholder="01127454951"
                  className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex-1">
                <label className="block mb-3 font-bold text-lg text-black text-right">
                  المحافظة
                </label>
                <input
                  type="text"
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleInputChange}
                  placeholder="القاهرة"
                  className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1">
                <label className="block mb-3 font-bold text-lg text-black text-right">
                  المدينة
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="مدينة نصر"
                  className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex-1">
                <label className="block mb-3 font-bold text-lg text-black text-right">
                  العنوان
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="شارع 15, مدينة نصر"
                  className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-[146px] h-[37px] border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <LiaTimesSolid className="w-5 h-5 text-[#5F5E5E]" />
                <span className="text-lg font-bold text-[#5F5E5E]">إلغاء</span>
              </Button>

              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSubmitting}
                className="w-[146px] h-[37px] bg-primary border-[1.5px] border-primary rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LiaCheckSolid className="w-5 h-5 text-white" />
                <span className="text-lg font-bold text-white">حفظ</span>
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default EditCustomerModal;
