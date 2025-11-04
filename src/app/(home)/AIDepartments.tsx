'use client';

import Image from 'next/image';
import React from 'react';

const AIDepartments: React.FC = () => {
  const cards = [
    {
      title: 'قسم تأكيد الطلبات عن طريق AI',
      items: [
        'واتساب، ميسنجر',
        'تيك توك، انستجرام.',
        'خلي الـ AI يوفر وقتك ومجهودك وفلوسك، ويشيل من عليك جزء من الاوبريشن بشكل كبير.',
      ],
    },
    {
      title: 'الأقسام التحليلية (Analytics & BI)',
      items: [
        'ذكاء الأعمال (Business Intelligence) – Dashboards، تقارير الأداء، التحليلات التنبؤية.',
        'إدارة المخاطر والامتثال (Risk & Compliance) – السياسات، المراجعة الداخلية، Audit trails.',
        'اسأل النظام عن أي معلومة تخص الطلبات، العملاء، أو التقارير – والـ AI هيرد عليك بالأرقام والتحليلات الدقيقة.',
      ],
    },
    {
      title: 'الأقسام الإدارية (HR & Admin)',
      items: [
        'الموارد البشرية (HRM) – الموظفين، الحضور والانصراف، المرتبات، تقييم الأداء.',
        'إدارة الرواتب (Payroll) – الاستحقاقات، الخصومات، التأمينات، الضرائب.',
        'إدارة الصلاحيات والمستخدمين (Access Control) – الأدوار، الصلاحيات، التتبع الأمني.',
      ],
    },
  ];

  return (
    <section className="relative py-5 max-sm:mb-10 md:py-35 text-white mt-10 px-4">
      {/* Background assets - Hidden on mobile */}
      <Image
        src="/icons/StarAsset.svg"
        alt=""
        width={1006}
        height={1006}
        className="absolute top-[-110px] right-0 w-[100%] -z-20 hidden md:block"
      />
      <Image
        src="/icons/Beam.svg"
        alt=""
        width={1006}
        height={1006}
        className="absolute top-[-230px] right-0 w-full max-w-[640px] hidden md:block"
      />
      <Image
        src="/icons/Robot.svg"
        alt=""
        width={1006}
        height={1006}
        className="absolute top-[-10px] right-0 w-full max-w-[550px] opacity-50 hidden md:block"
      />
      <Image
        src="/icons/AI-Model.svg"
        alt=""
        width={1006}
        height={1006}
        className="absolute top-[-110px] right-[180px] w-full max-w-[306px] hidden md:block"
      />

      {/* Cards */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-15 px-4 md:px-0">
        {cards.map((card, i) => (
          <div
            key={i}
            className="relative flex flex-col items-center overflow-visible"
          >
            {/* card */}
            <div className="w-full relative bg-gradient-to-br from-[#5D24E1] via-[#3C1D8A] to-[#121212] h-full rounded-3xl p-6 md:p-10 z-30 shadow-[0_0_30px_rgba(93,36,225,0.2)]">
              <h3 className="text-xl md:text-2xl mb-4 md:mb-6 text-white">
                {card.title}
              </h3>
              <ul className="space-y-4 md:space-y-9 text-gray-300 leading-relaxed pb-4 md:pb-8">
                {card.items.map((item, index) => (
                  <li key={index} className="text-sm md:text-base">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* glowing shape behind the card */}
            <div className="absolute bottom-0 w-[110%] -z-10 translate-y-6">
              <Image
                src="/icons/shape.png"
                alt=""
                width={400}
                height={60}
                className="w-full h-40 opacity-60 rounded-2xl select-none pointer-events-none"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AIDepartments;
