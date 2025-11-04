'use client';

import React from 'react';
import { Check } from 'lucide-react';

const SmartAccountsAndSuppliers: React.FC = () => {
  const data = [
    {
      title: 'قسم مشتريات الموردين',
      items: [
        'لكل مورد سجل كامل يجمع فواتيره، مدفوعاته، ومواعيد التسليم.',
        'النظام ينظّم علاقتك بالموردين ويخليك تتابع التوريد خطوة بخطوة بدون أوراق أو فوضى.',
        'تنبيهات ذكية قبل مواعيد التسليم لتفادي التأخير.',
        'تتبع المدفوعات والفواتير بدقة لكل مورد.',
        'تحليل التزام الموردين بنسبة التسليم وجودة الأداء.',
        'تقارير شهرية توضح المصروفات والموردين الأكثر تكراراً.',
      ],
    },
    {
      title: 'قسم الحسابات الذكي',
      items: [
        'من أول مصاريف الشحن لحد أرباحك الصافية – كل جنيه داخل أو خارج مسجل ومرتبط بالأرقام، علشان تشوف أرباحك الحقيقية لحظة بلحظة.',
        'عرض التدفقات النقدية اليومية (Cash Flow) لتعرف موقفك المالي لحظة بلحظة.',
        'تقارير مالية جاهزة تظهر التكاليف، الأرباح، ونسب النمو شهرياً.',
        'ربط مباشر مع الطلبات والحملات التسويقية لتحليل التكلفة مقابل العائد (ROI).',
        'في الحساب هتتعرف على كل أوردر بيكلفك مبلغ قد إيه في كل قسم من أقسام تشغيلك.',
      ],
    },
  ];

  return (
    <section className="relative py-15 sm:py-20 z-10 px-4">
      <div className="container mx-auto px-2 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        {data.map((card, i) => (
          <div
            key={i}
            className={`relative p-6 md:p-10 rounded-[25px] bg-black border border-[#5D24E1] overflow-hidden transition-transform duration-300 hover:scale-[1.02] ${
              i === 0
                ? 'shadow-[#3a168d] shadow-2xl sm:shadow-[30px_30px_50px_-15px_#3a168d]'
                : 'shadow-[#3a168d] shadow-2xl sm:shadow-[-30px_30px_50px_-15px_#3a168d]'
            }`}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white text-center md:text-right">
              {card.title}
            </h3>

            <ul className="space-y-4 md:space-y-8">
              {card.items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-200 leading-relaxed"
                >
                  <span className="flex items-center justify-center min-w-[24px] min-h-[24px] mt-1 flex-shrink-0">
                    <Check
                      className="w-5 h-5 text-purple-400"
                      strokeWidth={3}
                    />
                  </span>
                  <p className="text-[14px] md:text-[20px] text-[#939499] text-right">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SmartAccountsAndSuppliers;
