import React, { useState, useEffect, useMemo } from 'react';
import { LiaCheckSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import Input from '../ui/Input';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل البيانات الشخصية"
      onConfirm={handleSave}
      confirmText="حفظ"
      confirmIcon={<LiaCheckSolid className="w-5 h-5 text-white" />}
      isLoading={isSubmitting}
      confirmDisabled={!hasChanges}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Input
            label="الاسم الكامل"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="محمد بدر مصطفى"
            className="flex-1"
            inputClassName="h-[46px] rounded-[38px] border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white"
          />

          <Input
            label="رقم الهاتف الأول"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="01127454951"
            className="flex-1"
            inputClassName="h-[46px] rounded-[38px] border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Input
            label="رقم الهاتف الثاني"
            name="altPhone"
            value={formData.altPhone}
            onChange={handleInputChange}
            placeholder="01127454951"
            className="flex-1"
            inputClassName="h-[46px] rounded-[38px] border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white"
          />

          <Input
            label="المحافظة"
            name="governorate"
            value={formData.governorate}
            onChange={handleInputChange}
            placeholder="القاهرة"
            className="flex-1"
            inputClassName="h-[46px] rounded-[38px] border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Input
            label="المدينة"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="مدينة نصر"
            className="flex-1"
            inputClassName="h-[46px] rounded-[38px] border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white"
          />

          <Input
            label="العنوان"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="شارع 15, مدينة نصر"
            className="flex-1"
            inputClassName="h-[46px] rounded-[38px] border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white"
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default EditCustomerModal;
