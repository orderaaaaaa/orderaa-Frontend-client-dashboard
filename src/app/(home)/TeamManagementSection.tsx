'use client';

import Image from 'next/image';
import { Check, TrendingUp, TrendingDown, Users } from 'lucide-react';
import React from 'react';

export default function TeamPerformanceSection() {
  const data = [
    {
      title: 'لوحة افضل الأداء',
      description:
        'يعرض أفضل الموظفين في إنجاز الطلبات وتحقيق التارجت لخلق منافسة إيجابية.',
    },
    {
      title: 'سجل نشاط كامل لكل موظف',
      description:
        'تقدر تراجع كل خطوة قام بيها – من المكالمات للرسائل وحتى تغيير الحالات.',
    },
  ];

  return (
    <section className="relative py-20 text-white overflow-hidden">
      <div className="container mx-auto flex flex-col md:flex-row px-6 gap-10 relative">
        {/* ✅ Right Side - Text Content */}
        <div className="w-full md:w-1/2 text-right relative order-2 md:order-1">
          <ul className="space-y-5 text-[16px] md:text-[19px]">
            <li className="flex items-center gap-3">
              <TrendingUp className="text-green-400 w-5 h-5 flex-shrink-0" />
              <span>75% نسبة التسليم</span>
              <Check className="text-[#8E6BFF] w-5 h-5 flex-shrink-0" />
            </li>
            <li className="flex items-center gap-3">
              <TrendingDown className="text-red-400 w-5 h-5 flex-shrink-0" />
              <span>40% في تكلفة الطلب</span>
              <Check className="text-[#8E6BFF] w-5 h-5 flex-shrink-0" />
            </li>
            <li className="flex items-center gap-3">
              <TrendingUp className="text-green-400 w-5 h-5 flex-shrink-0" />
              <span>تقليل وقت التأكيد من 5 دقائق إلى 2</span>
              <Check className="text-[#8E6BFF] w-5 h-5 flex-shrink-0" />
            </li>
            <li className="flex items-center gap-3">
              <span>كشف الطلبات المتكررة والوهمية</span>
              <Check className="text-[#8E6BFF] w-5 h-5 flex-shrink-0" />
            </li>
            <li className="flex items-center gap-3">
              <span>رؤية مالية وتشغيلية ولحظية</span>
              <Check className="text-[#8E6BFF] w-5 h-5 flex-shrink-0" />
            </li>
          </ul>
        </div>

        {/* ✅ Left Side - Chart Image */}
        <div className="relative md:bottom-5 md:right-40 flex flex-col w-full md:max-w-[80%] text-center gap-4 justify-center order-1 md:order-2">
          <h3 className="text-xl md:text-2xl mb-4 md:mb-0">إدارة الفريق بذكاء</h3>
          <Image
            src="/icons/Dashboard4.svg"
            alt="مقارنة الموظفين"
            width={600}
            height={350}
            className="w-full md:w-[75%] rounded-2xl mx-auto"
          />
        </div>

        {/* ✅ Bottom Card - Mobile: Normal Flow, Desktop: Absolute */}
        <div className="order-3 md:absolute md:bottom-20 md:left-[960px] md:transform md:-translate-x-1/2 w-full md:max-w-[1050px] backdrop-blur-lg bg-white/5 border-2 border-[#5D24E1]/40 rounded-[30px] flex flex-col md:flex-row justify-between items-stretch gap-6 p-8 md:p-16 mt-10 md:mt-0">
          {data.map((item, i) => (
            <div
              key={i}
              className="flex flex-row-reverse items-center justify-between text-right w-full gap-6"
            >
              <div className="flex flex-col text-white space-y-2">
                <h3 className="text-xl md:text-2xl font-semibold">{item.title}</h3>
                <p className="text-[#A0A0A8] text-base md:text-lg leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="flex-shrink-0 text-gray-300">
                <Users className="w-8 h-8 md:w-10 md:h-10" strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
