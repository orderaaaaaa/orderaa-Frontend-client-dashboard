'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: 'ما هو نظام Orderaa؟',
      answer:
        'نظام Orderaa هو منصة متكاملة لإدارة الطلبات والمبيعات بسهولة وفعالية.',
    },
    {
      question: 'هل أحتاج خبرة تقنية لاستخدام النظام؟',
      answer:
        'لا تحتاج لأي خبرة تقنية، النظام مصمم ليكون سهل الاستخدام للجميع.',
    },
    {
      question: 'هل يمكن تجربة النظام قبل الاشتراك؟',
      answer: 'نعم، يمكنك تجربة النظام مجاناً قبل الاشتراك للتعرف على مميزاته.',
    },
    {
      question: 'هل النظام آمن؟',
      answer:
        'طبعاً، يستخدم Orderaa أحدث تقنيات التشفير لحماية بيانات العملاء والمعاملات بالكامل.',
    },
    {
      question: 'هل يمكن ربط النظام بمتجري الإلكتروني؟',
      answer:
        'نعم، يمكن ربط النظام بمتجرك الإلكتروني بسهولة عبر واجهات الربط الجاهزة.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 text-white z-10 px-4">
      <div className="container relative mx-auto px-2 md:px-6 grid grid-cols-1 md:grid-cols-2 z-10 gap-8 md:gap-12 items-center">
        {/* Right side */}
        <div className="text-right order-2 md:order-1">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">أسئلة متكررة</h2>
          <p className="text-base md:text-lg text-gray-300 mb-4 leading-relaxed">
            بعض الأسئلة التي تتكرر من عملاء وزوار الموقع.
            <br />
            هل لديك أي سؤال؟
          </p>
          <button className="bg-gradient-to-r from-[#9716EF] to-[#260A46] text-white mt-4 md:mt-6 mr-0 md:mr-15 px-6 md:px-25 py-3 rounded-[7px] text-base md:text-lg font-semibold hover:opacity-90 transition cursor-pointer">
            اشترك الآن
          </button>
        </div>

        {/* Left side - FAQ list */}
        <div className="bg-black/80 border border-[#491eb3] rounded-3xl shadow-[30px_25px_50px_-15px_#3a168d] p-6 md:p-10 shadow-[#491eb3] order-1 md:order-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="overflow-hidden mb-2 last:mb-0">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center py-4 text-right text-lg cursor-pointer font-medium text-gray-200 hover:text-white transition-all"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-[#5D24E199] transition-transform duration-300" />
                  ) : (
                    <ChevronLeft className="w-5 h-5 text-gray-400 transition-transform duration-300" />
                  )}
                </button>

                <div
                  className={`transition-all duration-500 ease-in-out  ${
                    isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {isOpen && (
                    <div className="bg-[#5D24E129] border rounded-[8px] border-[#5D24E199] text-[14px]  p-4 text-gray-300 text-right text-base">
                      {faq.answer}
                    </div>
                  )}
                </div>

                {!isOpen && <div className="border-b border-[#5D24E199]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Background glow */}
    </section>
  );
};

export default FaqSection;
