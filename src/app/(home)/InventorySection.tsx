'use client';

import React from 'react';
import Image from 'next/image';

const InventorySection: React.FC = () => {
  return (
    <section className="relative text-white py-26 container mx-auto text-right">
      <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Right side - Dashboard & Features */}
        <div>
          <h1 className="relative text-2xl mb-7 text-center">
            منصة واحدة لإدارة متجرك بالكامل!
          </h1>
          <Image
            src={'/icons/Dashboard2.svg'}
            width={10}
            height={10}
            alt=""
            className="w-[40%] top-[28%] right-[-44px] absolute"
          />
          <div className="flex flex-col items-end content-between gap-45">
            <div className="w-[60%] border py-10 px-6 rounded-3xl bg-white/5 backdrop-blur-sm border-gray-800">
              <div className="w-[85%] flex flex-col gap-4">
                <p className="flex gap-4 text-[14px]">
                  <span className="w-5 h-5 p-3 bg-[#C30EFF] rounded-full"></span>
                  تحديث لحظي للمخزون: كل عملية بيع أو إلغاء تُحدث الكمية مباشرة.
                </p>
                <p className="flex gap-4 text-[14px]">
                  <span className="w-5 h-5 p-3 bg-[#C30EFF] rounded-full"></span>
                  تنبيهات ذكية عند اقتراب نفاد المنتج.
                </p>
                <p className="flex gap-4 text-[14px]">
                  <span className="w-5 h-5 p-3 bg-[#C30EFF] rounded-full"></span>
                  تحديد المنتجات غير المتوفرة تلقائيًا لعدم قبول طلبات جديدة
                  عليها.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end content-between gap-41">
              <div className="w-[60%]  border p-6 rounded-3xl bg-white/5 backdrop-blur-sm border-gray-800">
                <div className="w-[95%] flex flex-col gap-4">
                  <p className="flex gap-4 text-[14px]">
                    <span className="w-5 h-5 p-3 bg-[#5D24E1] rounded-full"></span>
                    نظام Orderaa بيحوّل التسويق من تخمين إلى أرقام حقيقية لأنه
                    بيربط بين الإعلانات والمبيعات الفعلية.
                  </p>
                  <p className="flex gap-4 text-[14px]">
                    <span className="w-5 h-5 p-3 bg-[#5D24E1] rounded-full"></span>
                    تتبع الحملات بدقة: النظام يربط كل طلب بالحملة اللي جه منها.
                  </p>
                  <p className="flex gap-4 text-[14px]">
                    <span className="w-5 h-5 p-3 bg-[#5D24E1] rounded-full"></span>
                    تقارير أسبوعية تلقائية: توصلك على الإيميل فيها تحليل شامل
                    للأداء، من أول النقرات لحد التحصيل.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left side - Inventory overview */}
        <div className="flex flex-col items-center lg:items-center  lg:text-right">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            رؤية واضحة لحالة المخزون
          </h3>

          {/* Placeholder image for inventory chart */}
          <Image
            src={'/icons/Dashboard1.svg'}
            height={1000}
            width={2}
            alt=""
            className="w-full max-w-[520px] border "
          />

          <p className="text-gray-300 leading-relaxed text-center text-[16px] max-w-md">
            تابع مخزونك بدقة تعرف فورًا على المنتجات المتوفرة، المحدودة، أو غير
            المتوفرة داخل النظام بدون الحاجة للرجوع للمخزن أو فريق المبيعات.
          </p>
        </div>
      </div>

      {/* Glow background */}
    </section>
  );
};

export default InventorySection;
