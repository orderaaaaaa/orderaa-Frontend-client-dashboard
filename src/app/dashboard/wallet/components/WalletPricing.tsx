import React from 'react';
import { WALLET_PRICING_PLANS } from '../constants/plans';
import { IoCheckmark } from 'react-icons/io5';

function WalletPricing() {
  return (
    <section id="pricing" className="container mx-auto mt-13 px-4">
      <h2 className="text-2xl font-bold mb-8">خطة الشحن و الاشتراك </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {WALLET_PRICING_PLANS.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl p-9 border min-h-[450px] flex flex-col transition-transform duration-300 hover:scale-105 overflow-hidden text-right hover:border hover:border-[#5d24e1]
              ${
                plan.gradient
                  ? 'bg-[#5826E8] border-transparent text-white'
                  : 'bg-white border-gray-100 shadow-xl text-gray-800'
              } 
              `}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={plan.gradient ? 'text-white' : 'text-[#5826E8]'}>
                {plan.icon}
              </div>
              <h3 className="text-2xl font-medium">{plan.title}</h3>
            </div>

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-baseline gap-4 mb-4">
                <span
                  className={`text-4xl font-bold ${
                    plan.gradient ? 'text-white' : 'text-[#5826E8]'
                  }`}
                >
                  {plan.price}
                </span>
                <p
                  className={`text-xl font-medium ${
                    plan.gradient ? 'text-purple-100' : 'text-gray-900'
                  }`}
                >
                  {plan.subtitle}
                </p>
              </div>

              <ul className="space-y-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex justify-start items-center gap-3">
                    <span className="text-[#3cc900]">
                      <IoCheckmark className="w-7 h-7" />
                    </span>
                    <span className="text-[19px] font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-[98%] mx-auto mt-auto py-2 rounded-full font-bold transition cursor-pointer text-xl
                ${
                  plan.gradient
                    ? 'bg-white text-[#5826E8] hover:bg-gray-100'
                    : 'bg-white border border-[#5826E8] text-[#5826E8] hover:bg-[#5d24e1] hover:text-white'
                }`}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WalletPricing;
