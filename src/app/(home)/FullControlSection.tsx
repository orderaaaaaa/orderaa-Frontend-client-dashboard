import React from 'react';
import { Assets } from './assets';

export default function FullControlSection() {
  return (
    <section className="relative py-1 sm:py-24 text-center text-white overflow-hidden px-4">
      {/* Section Title */}
      <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-18 z-10 relative">
        التحكم الكامل في متجرك من خلال أوردر
      </h2>

      {/* Mobile: Grid Layout */}
      <div className="xl:hidden grid grid-cols-1 gap-2">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold mb-4">إدارة الحسابات</h3>
          <div className="relative w-full max-w-[400px] aspect-[4/3] max-xl:max-w-[80%] overflow-hidden max-xl:right-5">
            <img
              src={Assets.Dashboard5.src}
              alt="إدارة الحسابات"
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold sm:mb-4">إدارة الشحن</h3>
          <div className="relative w-full max-w-[400px] aspect-[4/4] sm:aspect-[4/3] max-xl:max-w-[80%] overflow-hidden max-xl:left-5">
            <img
              src={Assets.Dashboard6.src}
              alt="إدارة الشحن"
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold sm:mb-4">إدارة المخزون</h3>
          <div className="relative w-full max-w-[400px] aspect-[4/4] sm:aspect-[4/3] max-xl:max-w-[80%] overflow-hidden max-xl:right-7">
            <img
              src={Assets.Dashboard7.src}
              alt="إدارة المخزون"
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold sm:mb-4">إدارة الطلبات</h3>
          <div className="relative w-full max-w-[400px] aspect-[4/4] sm:aspect-[4/3] max-xl:max-w-[80%] overflow-hidden max-xl:left-5 max-sm:bottom-5">
            <img
              src={Assets.Dashboard8.src}
              alt="إدارة الطلبات"
              className="object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Desktop: Absolute Positioning (Original Layout) */}
      <div className="hidden xl:block container mx-auto relative w-full h-[550px]">
        <div className="absolute top-0 -left-18 w-full max-w-[650px] h-[650px]  flex flex-col items-center text-center z-100">
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            إدارة الحسابات
          </h3>
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <img
              src={Assets.Dashboard5.src}
              alt="إدارة الحسابات"
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* 2️⃣ إدارة الشحن */}
        <div className="absolute top-[80px] left-[300px] w-full max-w-[650px] h-[650px] flex flex-col items-center text-center z-80">
          <h3 className="text-lg md:text-xl font-semibold mb-4">إدارة الشحن</h3>
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <img
              src={Assets.Dashboard6.src}
              alt="إدارة الشحن"
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* 3️⃣ إدارة المخزون */}
        <div className="absolute top-0 right-[-40px] -translate-x-1/2 w-full max-w-[650px] h-[650px]  flex flex-col items-center text-center">
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            إدارة المخزون
          </h3>
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <img
              src={Assets.Dashboard7.src}
              alt="إدارة المخزون"
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* 4️⃣ إدارة الطلبات */}
        <div className="absolute top-[110px] bottom-0 -right-10 w-full max-w-[650px] h-[650px] flex flex-col items-center text-center">
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            إدارة الطلبات
          </h3>
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <img
              src={Assets.Dashboard8.src}
              alt="إدارة الطلبات"
              className="object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="md:mt-16 relative z-10">
        <button className="bg-gradient-to-r from-[#9716EF] to-[#260A46] text-white px-10 py-3 rounded-[7px] text-lg font-semibold hover:opacity-90 transition cursor-pointer">
          جرب سجل الان
        </button>
      </div>
    </section>
  );
}
