import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'sonner';

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

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
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
    <div
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
      onClick={onClose}
      style={{ fontFamily: 'Janna LT' }}
    >
      <div
        className="bg-white rounded-[20px] shadow-lg"
        style={{ width: '827px', maxHeight: '90vh', overflow: 'auto' }}
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
            <X size={24} />
          </button>
          <h2
            className="font-bold text-center flex-1"
            style={{ fontSize: '20px', lineHeight: '37px', color: '#000000' }}
          >
            تعديل البيانات الشخصية
          </h2>
          <div style={{ width: '24px' }}></div>
        </div>

        {/* Form Content */}
        <div className="p-8" style={{ direction: 'rtl' }}>
          {/* First Row: Name and Phone */}
          <div className="flex gap-10 mb-6">
            {/* Name */}
            <div className="flex-1">
              <label
                className="block mb-4 font-bold"
                style={{ fontSize: '18px', lineHeight: '33px', color: '#000000', textAlign: 'right' }}
              >
                الاسم الكامل
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="محمد بدر مصطفى"
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right"
                style={{
                  fontSize: '18px',
                  color: '#5F5E5E',
                  background: '#FFFFFF',
                  fontFamily: 'Janna LT'
                }}
              />
            </div>

            {/* Phone Number */}
            <div className="flex-1">
              <label
                className="block mb-4 font-bold"
                style={{ fontSize: '18px', lineHeight: '33px', color: '#000000', textAlign: 'right' }}
              >
                رقم الهاتف الأول
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="01127454951"
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right"
                style={{
                  fontSize: '18px',
                  color: '#5F5E5E',
                  background: '#FFFFFF',
                  fontFamily: 'Janna LT'
                }}
              />
            </div>
          </div>

          {/* Second Row: Alt Phone and Governorate */}
          <div className="flex gap-10 mb-6">
            {/* Alt Phone */}
            <div className="flex-1">
              <label
                className="block mb-4 font-bold"
                style={{ fontSize: '18px', lineHeight: '33px', color: '#000000', textAlign: 'right' }}
              >
                رقم الهاتف الثاني
              </label>
              <input
                type="text"
                name="altPhone"
                value={formData.altPhone}
                onChange={handleInputChange}
                placeholder="01127454951"
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right"
                style={{
                  fontSize: '18px',
                  color: '#5F5E5E',
                  background: '#FFFFFF',
                  fontFamily: 'Janna LT'
                }}
              />
            </div>

            {/* Governorate */}
            <div className="flex-1">
              <label
                className="block mb-4 font-bold"
                style={{ fontSize: '18px', lineHeight: '33px', color: '#000000', textAlign: 'right' }}
              >
                المحافظة
              </label>
              <input
                type="text"
                name="governorate"
                value={formData.governorate}
                onChange={handleInputChange}
                placeholder="القاهرة"
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right"
                style={{
                  fontSize: '18px',
                  color: '#5F5E5E',
                  background: '#FFFFFF',
                  fontFamily: 'Janna LT'
                }}
              />
            </div>
          </div>

          {/* Third Row: City and Address */}
          <div className="flex gap-10 mb-6">
            {/* City */}
            <div className="flex-1">
              <label
                className="block mb-4 font-bold"
                style={{ fontSize: '18px', lineHeight: '33px', color: '#000000', textAlign: 'right' }}
              >
                المدينة
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="مدينة نصر"
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right"
                style={{
                  fontSize: '18px',
                  color: '#5F5E5E',
                  background: '#FFFFFF',
                  fontFamily: 'Janna LT'
                }}
              />
            </div>

            {/* Address */}
            <div className="flex-1">
              <label
                className="block mb-4 font-bold"
                style={{ fontSize: '18px', lineHeight: '33px', color: '#000000', textAlign: 'right' }}
              >
                العنوان
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="شارع 15, مدينة نصر"
                className="w-full h-[46px] px-4 rounded-[38px] border border-[#ECECEC] text-right"
                style={{
                  fontSize: '18px',
                  color: '#5F5E5E',
                  background: '#FFFFFF',
                  fontFamily: 'Janna LT'
                }}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-start mt-8">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 rounded-[28px] border-[1.5px] font-bold transition-colors disabled:opacity-50"
              style={{
                background: '#5D24E1',
                borderColor: '#5D24E1',
                color: '#FFFFFF',
                fontSize: '18px',
                minWidth: '146px',
                height: '37px',
                justifyContent: 'center',
              }}
            >
              <span>حفظ</span>
              <Check size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;


