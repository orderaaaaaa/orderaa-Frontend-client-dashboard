'use client';

import { Check } from 'lucide-react';
import React from 'react';
import { SmartMarketingPoints } from '@/constants/Home';
import { Assets } from './assets';

const SmartMarketing: React.FC = () => {
  return (
    <section className="relative py-10 sm:py-20 z-10 container mx-auto w-full px-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-16">
        {/* 💜 Right Text Content */}
        <div className="w-full lg:w-1/2 text-right leading-relaxed order-2 lg:order-1">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-10 text-white">
            التسويق الذكي
          </h2>

          <ul className="space-y-4 md:space-y-6">
            {SmartMarketingPoints.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-3 justify-start text-[16px] md:text-[20px] lg:text-[22px]"
              >
                <span className="flex items-center justify-center min-w-[24px] min-h-[24px] mt-1 flex-shrink-0">
                  <Check className="w-5 h-5 text-purple-400" strokeWidth={3} />
                </span>
                <p className="text-[#939499]">{point}</p>
              </li>
            ))}
          </ul>
        </div>
        {/* 💜 Left img with Glow */}
        {/* img Box */}
        <div className="w-full lg:w-1/2 order-1 lg:order-2">
          <img
            src={Assets.Frame1.src}
            width={10}
            height={1}
            alt="التسويق الذكي"
            className="rounded-[30px] w-full max-w-full"
          />
        </div>
      </div>
    </section>
  );
};

export default SmartMarketing;
