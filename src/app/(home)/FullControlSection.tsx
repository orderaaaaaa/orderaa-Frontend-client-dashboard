import Image from 'next/image';
import React from 'react';

export default function FullControlSection() {
  return (
    <section className="relative py-24 text-center text-white overflow-hidden">
      {/* Section Title */}
      <h2 className="text-3xl md:text-4xl font-bold mb-18 z-10 relative">
        التحكم الكامل في متجرك من خلال أوردر
      </h2>

      {/* Wrapper with fixed height for positioning */}
      <div className="relative w-full h-[550px]">
        {/* 1️⃣ إدارة الحسابات */}
        <div className="absolute top-0 left-0 w-full max-w-[650px] h-[650px]  flex flex-col items-center text-center z-100">
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            إدارة الحسابات
          </h3>
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src="/icons/Dashboard5.svg"
              alt="إدارة الحسابات"
              fill
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* 2️⃣ إدارة الشحن */}
        <div className="absolute top-[80px] left-[400px] w-full max-w-[650px] h-[650px] flex flex-col items-center text-center z-80">
          <h3 className="text-lg md:text-xl font-semibold mb-4">إدارة الشحن</h3>
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src="/icons/Dashboard6.svg"
              alt="إدارة الشحن"
              fill
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* 3️⃣ إدارة المخزون */}
        <div className="absolute top-0 right-[40px] -translate-x-1/2 w-full max-w-[650px] h-[650px]  flex flex-col items-center text-center">
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            إدارة المخزون
          </h3>
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src="/icons/Dashboard7.svg"
              alt="إدارة المخزون"
              fill
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* 4️⃣ إدارة الطلبات */}
        <div className="absolute top-[100px] bottom-0 right-0 w-full max-w-[650px] h-[650px] flex flex-col items-center text-center">
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            إدارة الطلبات
          </h3>
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src="/icons/Dashboard8.svg"
              alt="إدارة الطلبات"
              fill
              className="object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-16 relative z-10">
        <button className="bg-gradient-to-r from-[#9716EF] to-[#260A46] text-white px-10 py-3 rounded-[7px] text-lg font-semibold hover:opacity-90 transition cursor-pointer">
          جرب سجل الان
        </button>
      </div>
    </section>
  );
}
