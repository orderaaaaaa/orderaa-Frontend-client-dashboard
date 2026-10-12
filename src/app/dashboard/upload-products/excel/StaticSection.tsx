import React from 'react';

const StaticSection = () => {
  return (
    <div className="bg-gray-50 px-4 sm:px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-[#CCCCCC29] border border-[#CCCCCCCC] rounded-xl p-4 sm:p-8 shadow-sm">
        <h3 className="font-semibold text-xl sm:text-[24px] text-gray-900 mb-4 sm:mb-6 text-right">
          تعليمات مهمة
        </h3>
        <ul className="list-disc list-inside space-y-4 text-gray-600 font-normal leading-relaxed">
          <li className="text-base sm:text-lg">
            تأكد من تنزيل القالب المناسب (Orderaa أو EasyOrder) واستخدام نفس التنسيق.
          </li>
          <li className="text-base sm:text-lg">
            يجب ملء جميع الحقول المطلوبة: الاسم الكامل، رقم الهاتف، العنوان، تكلفة الشحن، واسم المنتج.
          </li>
          <li className="text-base sm:text-lg">
            تأكد من كتابة أرقام الهواتف بشكل صحيح (11 رقم للأرقام المصرية أو 10-15 رقم للأرقام الدولية).
          </li>
          <li className="text-base sm:text-lg">
            يجب أن تكون الأسعار والتكاليف أرقام صحيحة وموجبة.
          </li>
          <li className="text-base sm:text-lg">
            الملفات المدعومة: Excel (.xlsx, .xls) أو CSV (.csv).
          </li>
          <li className="text-base sm:text-lg">
            سيتم التحقق من جميع الطلبات وإظهار الأخطاء إن وجدت قبل الحفظ في النظام.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StaticSection;
