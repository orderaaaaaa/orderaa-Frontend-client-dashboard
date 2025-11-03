'use client';

import React from 'react';
import { Check } from 'lucide-react';

const Departments: React.FC = () => {
  const data = [
    {
      title: 'الأقسام الداعمة',
      items: [
        'إدارة الشحن والنقل (Logistics / Fleet) – تتبع الشحنات، أوامر التوصيل، المندوبين.',
        'إدارة الجودة (Quality Control) – الفحص، الاعتماد، التقارير.',
        'الدعم الفني (Helpdesk / ITSM) – التذاكر، الحلول، إدارة الأنظمة.',
      ],
    },
    {
      title: 'الأقسام التكاملية (Integration & Extensions)',
      items: [
        'الربط مع الأنظمة الخارجية –  API Management & Integrations (Shopify, Easy Orders, WhatsApp، وغيرها).',
        'بوابة العملاء والموردين (Portals) – لتسهيل التعامل المباشر عبر الإنترنت.',
        'الأتمتة (Automation / AI Agent) – روبوتات محادثة، تأكيد الطلبات، سير العمل الذكي.',
      ],
    },
  ];

  return (
    <section className="relative py-20 z-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {data.map((card, i) => (
          <div
            key={i}
            className={`relative p-10 rounded-[25px] bg-black border border-[#5D24E1] overflow-hidden transition-transform duration-300 hover:scale-[1.02] ${
              i === 0
                ? 'shadow-[30px_30px_50px_-15px_#3a168d]'
                : 'shadow-[-30px_30px_50px_-15px_#3a168d]'
            }`}
          >
            <h3 className="text-3xl font-bold mb-8">{card.title}</h3>

            <ul className="space-y-8 pb-15">
              {card.items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-200 leading-relaxed"
                >
                  <span className="flex items-center justify-center min-w-[24px] min-h-[24px] mt-1">
                    <Check
                      className="w-5 h-5 text-purple-400"
                      strokeWidth={3}
                    />
                  </span>
                  <p className="text-[20px] text-[#939499]">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Departments;
