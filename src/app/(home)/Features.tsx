'use client';

import React from 'react';
import Image from 'next/image';

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

const featuresTop: Feature[] = [
  {
    icon: '/icons/layout.svg',
    title: 'أوتوميشن ذكي يوفر وقت فريقك',
    desc: 'نظام يدير المكالمات، الرسائل، وتحديث الطلبات تلقائيًا بدون تدخل يدوي.',
  },
  {
    icon: '/icons/shareit.svg',
    title: 'إدارة الطلبات من أول مكالمة لحد التسليم',
    desc: 'تتبع كل مرحلة بسهولة: تأكيد – تغليف – شحن – تحصيل – مرتجع.',
  },
  {
    icon: '/icons/Connection.svg',
    title: 'تواصل تلقائي مع العملاء عبر واتساب',
    desc: 'رسائل ودّية فورية بعد المكالمة لزيادة فرص التأكيد وتقليل الإلغاء بدون تدخل بشري.',
  },
];

const featuresBottom: Feature[] = [
  {
    icon: '/icons/analys.svg',
    title: 'سجل تفاعلات ذكي لكل عميل',
    desc: 'اعرف كل مكالمة أو رسالة واتساب تمت مع العميل، وراجع الأداء بسهولة.',
  },
  {
    icon: '/icons/WebDesignTools.svg',
    title: 'تكامل كامل مع أدواتك المفضلة',
    desc: 'يربط متجرك بـ Shopify، EasyOrders، شركات الشحن، و Meta CAPI تلقائيًا.',
  },
  {
    icon: '/icons/ClientService.svg',
    title: 'تقارير وتحليلات دقيقة لحركة المبيعات',
    desc: 'اعرف أداء متجرك لحظة بلحظة: الأرباح، نسب التحويل، المصروفات والمبيعات.',
  },
];

const Features: React.FC = () => {
  return (
    <section className="relative py-20 text-white text-right font-sans px-4">
      <div className="container mx-auto px-2 md:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
            تعرف على مميزات اوردرا
          </h2>
          <p className="text-[#B8A3EB] text-lg md:text-xl lg:text-2xl">
            اكتشف الأدوات التي تقود إلى النجاح
          </p>
        </div>

        {/* 🔹 Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 place-items-center gap-0 bg-[#000] shadow-[-30px_20px_50px_-15px_#3a168d] py-8 md:py-15 mb-6 md:mb-10 shadow-[#491eb3] rounded-2xl border border-[#491eb3] relative z-10">
          {featuresTop.map((feature, idx) => (
            <div
              key={feature.title}
              className={`w-full flex flex-col justify-center items-center text-center p-4 md:p-0 ${
                idx === 1 ? 'md:border-x border-[#EDF0EE40]' : ''
              } ${idx !== 2 ? 'border-b md:border-b-0 border-[#EDF0EE40]' : ''}`}
            >
              <div className="flex flex-col gap-4 justify-center items-center">
                <div className="flex flex-col items-center">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={60}
                    height={60}
                    className="mb-4 w-[50px] h-[50px]"
                  />
                  <h3 className="text-[18px] md:text-[20px] w-full max-w-[250px] font-semibold mb-2">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-[13px] md:text-[14px] max-w-[280px] px-4">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔹 Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 place-items-center gap-0 bg-[#000] shadow-[30px_20px_50px_-15px_#3a168d] p-6 md:p-12 shadow-[#491eb3] rounded-2xl border border-[#491eb3] relative z-10">
          {featuresBottom.map((feature, idx) => (
            <div
              key={feature.title}
              className={`w-full flex flex-col justify-center items-center text-center p-4 md:p-0 ${
                idx === 1 ? 'md:border-x border-[#EDF0EE40]' : ''
              } ${idx !== 2 ? 'border-b md:border-b-0 border-[#EDF0EE40]' : ''}`}
            >
              <div className="flex flex-col gap-4 justify-center items-center">
                <div className="flex flex-col items-center">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={60}
                    height={60}
                    className="mb-4 w-[50px] h-[50px]"
                  />
                  <h3 className="text-[18px] md:text-[20px] w-full max-w-[250px] font-semibold mb-2">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-[13px] md:text-[14px] max-w-[280px] px-4">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-purple-900/20 to-transparent blur-3xl" />
    </section>
  );
};

export default Features;
