import React, { useState, useEffect, useMemo } from 'react';
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

  // Check if any value has changed
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

  if (!isOpen) return null;

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

  const handleCancel = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] shadow-lg w-full max-w-[827px] mx-4 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div
          className="h-[79px] rounded-t-[20px] flex items-center justify-between px-6"
          style={{
            background: 'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <button
            onClick={onClose}
            className="text-black hover:text-gray-700 transition-colors"
          >
            <LiaTimesSolid className="w-6 h-6 cursor-pointer" />
          </button>
          <h2 className="font-bold text-center flex-1 text-xl text-black">
            تعديل البيانات الشخصية
          </h2>
          <div className="w-6"></div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {/* First Row: Name and Phone */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Name */}
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
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
              />
            </div>

            {/* Phone Number */}
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
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
              />
            </div>
          </div>

          {/* Second Row: Alt Phone and Governorate */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Alt Phone */}
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
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
              />
            </div>

            {/* Governorate */}
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
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
              />
            </div>
          </div>

          {/* Third Row: City and Address */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* City */}
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
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
              />
            </div>

            {/* Address */}
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
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right text-lg text-[#5F5E5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-[146px] h-[37px] border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <LiaTimesSolid className="w-5 h-5 text-[#5F5E5E]" />
              <span className="text-lg font-bold text-[#5F5E5E]">إلغاء</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSubmitting}
              className="w-[146px] h-[37px] bg-[#5D24E1] border-[1.5px] border-[#5D24E1] rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LiaCheckSolid className="w-5 h-5 text-white" />
              <span className="text-lg font-bold text-white">حفظ</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;
