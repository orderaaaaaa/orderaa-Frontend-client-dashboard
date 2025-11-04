'use client';

import React from 'react';
import { Check } from 'lucide-react';

const DepartmentsFinanceAndOps: React.FC = () => {
  const data = [
    {
      title: 'الأقسام التشغيلية',
      items: [
        'إدارة المشتريات (Procurement) – متابعة الموردين، عروض الأسعار، أوامر الشراء، الفواتير.',
        'إدارة المخزون (Inventory Management) – الكميات، الحركات، التحويلات بين المخازن، الجرد، التنبيهات.',
        'إدارة المبيعات (Sales) – أوامر البيع، الفواتير، العمولات، تتبع العملاء.',
        'إدارة العملاء (CRM) – تتبع العملاء، المكالمات، الشكاوى، متابعة الأداء، العروض الترويجية.',
        'إدارة سلسلة الإمداد (Supply Chain) – ربط المشتريات بالمخزون بالمبيعات والشحن.',
      ],
    },
    {
      title: 'الأقسام المالية (Financial)',
      items: [
        'المحاسبة العامة (General Ledger) – القيود، الحسابات، التسويات، مراكز التكلفة.',
        'الحسابات الدائنة (Accounts Payable) – الموردين والمدفوعات.',
        'الحسابات المدينة (Accounts Receivable) – العملاء والتحصيلات.',
        'الخزانة والبنوك (Treasury) – التدفقات النقدية، الحسابات البنكية، الموازنات.',
        'الميزانيات والتقارير المالية (Financial Reporting) – القوائم، التحليل المالي، مؤشرات الأداء.',
      ],
    },
  ];

  return (
    <section className="relative py-20 z-10 px-4">
      <div className="container mx-auto px-2 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {data.map((card, i) => (
          <div
            key={i}
            className={`relative p-6 md:p-10 rounded-[25px] bg-black border border-[#5D24E1] overflow-hidden transition-transform duration-300 hover:scale-[1.02] ${
              i === 0
                ? 'shadow-[30px_30px_50px_-15px_#3a168d]'
                : 'shadow-[-30px_30px_50px_-15px_#3a168d]'
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
                  <p className="text-[16px] md:text-[20px] text-[#939499] text-right">
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

export default DepartmentsFinanceAndOps;
