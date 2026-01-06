import React from 'react';
import { Zen_Dots } from 'next/font/google';
import Image from 'next/image';
import { Assets } from './assets';

// ✅ Import Zen Dots only here (since only Hero uses it)
const zenDots = Zen_Dots({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

function Hero() {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 container justify-center items-center mx-auto relative px-4 md:px-0">
        {/* imgs - Hidden on mobile */}
        <div className="relative  justify-center hidden md:grid">
          <img
            src={Assets.AIModel.src}
            className="w-full max-w-[450.57px] "
            width={200}
            height={200}
            alt=""
          />
          <img
            src={Assets.Dashboard.src}
            className="w-full max-w-[540px] relative top-[-120px] left-[25px]"
            width={200}
            height={200}
            alt=""
          />
        </div>
        <div className="flex flex-col justify-start gap-7 items-center text-center md:text-center">
          <h1 className={`text-3xl md:text-4xl`}>
            مع
            <br />
            <span className={`${zenDots.className} text-5xl md:text-8xl mb-4`}>
              orderaa
            </span>
          </h1>
          <p className="w-full text-[18px] md:text-[24px] text-center max-w-[450px] px-4">
            ستجد ما تحتاجة لادارة متجرك الالكتروني باستخدام الذكاء الاصطناعي
          </p>
          <button className="bg-gradient-to-l from-[#260946] to-[#9716EF] cursor-pointer font-bold text-[15px] md:text-[17px] py-3 px-7 !rounded-[10px]">
            ابدء تجربتك المجانية لمدة 7 ايام{' '}
          </button>
          <div className="grid grid-cols-2 gap-4">
            <p className="text-end text-[16px] md:text-[20px] m-0 p-0">
              + 578M <br />{' '}
              <span className="text-[10px] md:text-[12px]">عملاء نشطين</span>
            </p>
            <div className="flex gap-2 relative">
              <Image
                src={Assets.Person3}
                className="w-full max-w-[40px] max-h-[40px] rounded-full border-2 border-white"
                width={40}
                height={40}
                alt=""
              />

              <Image
                src={Assets.Person1}
                className="w-full max-w-[40px] max-h-[40px] rounded-full border-2 border-white absolute right-6"
                width={40}
                height={40}
                alt=""
              />
              <Image
                src={Assets.Person2}
                className="w-full max-w-[40px] max-h-[40px] rounded-full border-2 border-white"
                width={40}
                height={40}
                alt=""
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
