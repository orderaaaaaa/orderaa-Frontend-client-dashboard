'use client';

import React from 'react';
import { RefreshCcw, Wallet } from 'lucide-react';

function Pricing() {
  const plans = [
    {
      title: 'اشتراك شهري ثابت',
      price: '30 دولار',
      subtitle: '(2000 جنيه)',
      icon: <RefreshCcw className="w-5 h-5 text-[#6135c9]" />,
      features: [
        'عدد طلبات حتى 2500 طلب',
        'تكلفة الطلب 80 قرشًا',
        'لا يخص رسوم كل طلب على حدا',
        'مبلغ ثابت شهريًا',
      ],
      button: 'اشحن الآن',
      highlight: true,
      gradient: true, // 💜 apply gradient to this card
    },
    {
      title: 'خطة 20 دولار',
      price: '20 دولار',
      subtitle: '(1000 جنيه)',
      icon: <Wallet className="w-5 h-5 text-[#6135c9]" />,
      features: [
        'شحن محفظتك بقيمة 5 دولار',
        'يخصم 1 جنيه على كل طلب',
        'عدد الطلبات 250 طلب',
      ],
      button: 'اشحن الآن',
    },
    {
      title: 'خطة 10 دولار',
      price: '10 دولار',
      subtitle: '(500 جنيه)',
      icon: <Wallet className="w-5 h-5 text-[#6135c9]" />,
      features: [
        'شحن محفظتك بقيمة 5 دولار',
        'يخصم 1 جنيه على كل طلب',
        'عدد الطلبات 250 طلب',
      ],
      button: 'اشحن الآن',
    },
    {
      title: 'خطة 5 دولار',
      price: '5 دولار',
      subtitle: '(250 جنيه)',
      icon: <Wallet className="w-5 h-5 text-[#6135c9]" />,
      features: [
        'شحن محفظتك بقيمة 5 دولار',
        'يخصم 1 جنيه على كل طلب',
        'عدد الطلبات 250 طلب',
      ],
      button: 'اشحن الآن',
    },
  ];

  return (
    <section className="container mx-auto py-20 px-4 text-center text-white">
      <h2 className="text-3xl font-bold mb-17">باقات وأسعار أوردرًا</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...plans].reverse().map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl p-6 border h-[400px] border-purple-700 flex flex-col shadow-lg transition-transform duration-300 hover:scale-105 bg-[#0d0d0d] overflow-hidden`}
          >
            {/* 💜 Radial Gradient from Top-Left */}
            {plan.gradient && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#4C23A9_0%,_#00000000_75%)] opacity-80 z-0" />
            )}
            <div className="flex items-center gap-4 mb-6 ">
              <div>{plan.icon}</div>
              <h3 className="text-lg font-semibold">{plan.title}</h3>
            </div>
            <div className="relative z-10 flex flex-col gap-10">
              {/* Header */}

              {/* Price */}
              <div className="flex items-center  gap-2 mb-1">
                <span className="text-2xl font-bold text-[#b8a3eb]">
                  {plan.price}
                </span>
                <p>{plan.subtitle}</p>
              </div>

              {/* Features */}
              <ul className="text-right space-y-4">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex justify-start text-[15px] items-center gap-2 text-right"
                  >
                    <span className="text-green-400">✔</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Button */}
            <button
              className={`w-full !mt-6 relative z-10 py-2 rounded-full border cursor-pointer border-purple-500 hover:bg-purple-700 ${
                plan.highlight ? ' top-6' : 'top-15'
              } transition`}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10">
        <button className="bg-gradient-to-r from-[#9716EF] to-[#260A46] text-white px-25 py-3 rounded-[7px] text-lg font-semibold hover:opacity-90 transition cursor-pointer">
          جرب الآن
        </button>
      </div>
    </section>
  );
}

export default Pricing;
