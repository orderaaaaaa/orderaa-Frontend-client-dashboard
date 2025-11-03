'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import React from 'react';

const SmartMarketing: React.FC = () => {
  const points = [
    'كل جنيه في إعلانك ليه نتيجة واضحة',
    'تحليل دقيق لأداء الإعلان: اعرف بالضبط كل حملة جابت كام طلب وتأثيرها على المبيعات.',
    'قرارات مدعومة بالأرقام: أوقف الإعلانات الضعيفة وزد ميزانية الحملات الناجحة بثقة.',
    'تقرير تلقائي بالأداء الأسبوعي: يوصلك تلقائيًا عشان تتابع النتائج بسهولة.',
  ];

  return (
    <section className="relative py-20 z-10 container mx-auto w-full">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* 💜 Right Text Content */}
        <div className=" lg:w-1/2 text-right leading-relaxed">
          <h2 className="text-4xl font-bold mb-10 text-white">التسويق الذكي</h2>

          <ul className="space-y-6">
            {points.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-3 justify-start text-[22px] "
              >
                <span className="flex items-center justify-center min-w-[24px] min-h-[24px] mt-1">
                  <Check className="w-5 h-5 text-purple-400" strokeWidth={3} />
                </span>
                <p className="text-[#939499]">{point}</p>
              </li>
            ))}
          </ul>
        </div>
        {/* 💜 Left Image with Glow */}
        {/* Image Box */}
        <Image
          src="/icons/frame1.svg"
          width={10}
          height={1}
          alt="التسويق الذكي"
          className="rounded-[30px] w-full  max-w-1/2"
        />
      </div>
    </section>
  );
};

export default SmartMarketing;
