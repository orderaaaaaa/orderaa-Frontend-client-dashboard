import React from 'react';

const StaticSection = () => {
  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-[#CCCCCC29] border border-[#CCCCCCCC] rounded-xl max-sm:py-3 p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-[24px] text-gray-900 mb-6 text-right">
          تعليمات مهمة
        </h3>
        <ul className="list-disc list-inside space-y-4 text-gray-600 font-normal leading-relaxed">
          <li className="font-base text-lg">
            تأكد من تنزيل القالب المناسب (Orderaa أو EasyOrder) واستخدام نفس التنسيق.
          </li>
          <li className="font-base text-lg">
            يجب ملء جميع الحقول المطلوبة: الاسم الكامل، رقم الهاتف، العنوان، تكلفة الشحن، واسم المنتج.
          </li>
          <li className="font-base text-lg">
            تأكد من كتابة أرقام الهواتف بشكل صحيح (11 رقم للأرقام المصرية أو 10-15 رقم للأرقام الدولية).
          </li>
          <li className="font-base text-lg">
            يجب أن تكون الأسعار والتكاليف أرقام صحيحة وموجبة.
          </li>
          <li className="font-base text-lg">
            الملفات المدعومة: Excel (.xlsx, .xls) أو CSV (.csv).
          </li>
          <li className="font-base text-lg">
            سيتم التحقق من جميع الطلبات وإظهار الأخطاء إن وجدت قبل الحفظ في النظام.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StaticSection;
