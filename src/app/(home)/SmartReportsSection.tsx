import { Check } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export default function SmartReportsSection() {
  return (
    <section className="relative container mx-auto overflow-hidden pt-5 md:py-20 px-6 md:px-12">
      <h2 className="text-3xl md:text-4xl text-center font-bold mb-20">
        التقارير والتحليل الذكي
      </h2>
      <div className=" flex flex-col-reverse md:flex-row items-center md:items-start gap-12 max-md:gap-25">
        {/* Image Section */}
        <div className="w-full md:w-[60%] relative flex flex-col items-center md:items-end ">
          {/* Bottom Image */}
          <div className="relative w-full md:w-[590px] md:-bottom-13 order-1">
            <Image
              src="/icons/Dashboard9.svg"
              alt="التقارير والتحليل الذكي"
              width={900}
              height={600}
              className="w-full h-auto object-contain rounded-[20px]"
            />
          </div>

          {/* Top Image (overlapping) */}
          <div className="absolute top-[-60px] md:top-[-55px] right-0 w-[100%] md:w-[590px]">
            <Image
              src="/icons/Dashboard10.svg"
              alt="تحليل الأداء"
              width={900}
              height={600}
              className="w-full h-auto object-contain rounded-[20px]"
            />
          </div>
        </div>
        {/* Text Section */}{' '}
        <div className="w-full md:w-[40%] text-right">
          <div className="space-y-10">
            {/* Report 1 */}
            <div>
              <div className="flex items-center  gap-5 mb-5">
                <Check className="text-[#C30EFF]" />
                <h3 className="text-[29px] text-[#FFFFFFCC]">تقارير التشغيل</h3>
              </div>
              <p className="text-[#FFFFFFB2] leading-relaxed text-lg">
                نسب التحويل بكل مرحلة، مقارنة أداء الموظفين، أداء شركات الشحن،
                تحليل أسباب الإلغاء.
              </p>
            </div>

            {/* Report 2 */}
            <div>
              <div className="flex items-center  gap-2 mb-5">
                <Check className="text-[#C30EFF]" />
                <h3 className="text-[29px] text-[#FFFFFFCC]">تقارير مالية</h3>
              </div>
              <p className="text-[#FFFFFFB2] leading-relaxed text-lg">
                أرباح وخسائر شهرية، تكلفة الطلب (CPP) حسب <br />
                الحملة، التدفقات النقدية اليومية.
              </p>
            </div>

            {/* Report 3 */}
            <div>
              <div className="flex items-center  gap-2 mb-5">
                <Check className="text-[#C30EFF] text-2xl" />
                <h3 className="text-[29px] text-[#FFFFFFCC]">
                  تقارير الأداء التسويقي
                </h3>
              </div>
              <p className="text-[#FFFFFFB2] leading-relaxed text-lg">
                ربط الطلبات بالحملات الإعلانية، حساب ROAS <br /> بدقة، تتبع
                التحويل من إعلان لتأكيد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
