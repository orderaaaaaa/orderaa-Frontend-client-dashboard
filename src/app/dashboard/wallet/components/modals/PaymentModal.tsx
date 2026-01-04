'use client';
import React, { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { CiCreditCard1, CiBank } from 'react-icons/ci';
import { LiaWalletSolid } from 'react-icons/lia';
import { WalletPricingPlan } from '../../constants/plans';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WalletPricingPlan;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-xl rounded-3xl p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IoCloseOutline size={28} />
        </button>

        {/* Header */}
        <div className="text-center mt-4 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            اتمام عمليه الدفع
          </h2>
          <p className="text-gray-500 text-lg">اختر طريقة الدفع</p>
        </div>

        {/* Summary Box */}
        <div className="bg-[#F8F5FF] rounded-2xl p-6 mb-8 border border-[#EFECFF]">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200/60">
            <span className="text-gray-600 font-medium">الخطة المختارة</span>
            <span className="text-gray-900 font-bold">{plan.title}</span>
          </div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200/60">
            <span className="text-gray-600 font-medium">المبلغ المطلوب</span>
            <div className="text-left">
              <p className="text-[#5d24e1] font-bold text-xl">
                {plan.price.replace(' دولار', '$')}
              </p>
              <p className="text-gray-400 text-sm">{plan.subtitle}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">رصيدك الحالي</span>
            <span className="text-gray-900 font-bold">250 دولار</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4 mb-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">طريقة الدفع</h3>

          {[
            {
              id: 'card',
              label: 'بطاقة الائتمان',
              icon: <CiCreditCard1 size={24} />,
            },
            { id: 'bank', label: 'حساب مصرفي', icon: <CiBank size={24} /> },
            {
              id: 'wallet',
              label: 'محفظة رقمية',
              icon: <LiaWalletSolid size={24} />,
            },
          ].map((method) => (
            <label
              key={method.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                ${
                  paymentMethod === method.id
                    ? 'border-[#5d24e1] bg-[#F8F5FF]'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${
                    paymentMethod === method.id
                      ? 'border-[#5d24e1]'
                      : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === method.id && (
                    <div className="w-3 h-3 bg-[#5d24e1] rounded-full" />
                  )}
                </div>
                <span className="font-semibold text-gray-800">
                  {method.label}
                </span>
              </div>
              <div className="text-gray-400">{method.icon}</div>
              <input
                type="radio"
                name="payment"
                className="hidden"
                checked={paymentMethod === method.id}
                onChange={() => setPaymentMethod(method.id)}
              />
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button className="flex-1 bg-[#5d24e1] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#4a1dc4] transition-colors shadow-lg shadow-purple-200">
            تاكيد الدفع
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white border-2 border-[#5d24e1] text-[#5d24e1] py-4 rounded-2xl font-bold text-lg hover:bg-purple-50 transition-colors"
          >
            إلغاء الدفع
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
