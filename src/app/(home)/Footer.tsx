'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer dir="rtl" className="relative py-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        {/* Right side - Logo */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <Image
            src="/icons/Orderaa.svg"
            alt="Orderaa Logo"
            width={160}
            height={50}
            className="object-contain"
          />
        </div>

        {/* Middle - Navigation */}
        <div className="flex flex-col items-center gap-6">
          <ul className="flex gap-10 text-lg">
            <li>
              <Link
                href="#"
                className="hover:text-purple-400 transition-colors duration-300"
              >
                الصفحة الرئيسية
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-purple-400 transition-colors duration-300"
              >
                الباقات
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-purple-400 transition-colors duration-300"
              >
                الخدمات
              </Link>
            </li>
          </ul>
        </div>

        {/* Left side - Social icons */}
        <div className="flex flex-col mb-4 items-center md:items-end gap-4">
          <p className="text-lg font-medium text-center">تابعنا على</p>
          <div className="flex gap-3">
            {['WhatsApp', 'facebook', 'Linkedin', 'instgram', 'TikTok'].map(
              (icon) => (
                <Link
                  key={icon}
                  href="#"
                  className="hover:scale-110 transition-transform duration-300"
                >
                  <Image
                    src={`/icons/${icon}.svg`}
                    width={35}
                    height={35}
                    alt={icon}
                    className="object-contain"
                  />
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Privacy policy */}
      <div className="mt-8 text-center">
        <Link
          href="#"
          className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
        >
          سياسة الخصوصية والشروط
        </Link>
      </div>

      {/* Floating chat icon (bottom-left mirrored) */}
      <div className="fixed bottom-25 right-20 z-50 ">
        <div className="relative">
          <div className="absolute inset-0 bg-[#491eb3] blur-2xl opacity-50 rounded-full animate-pulse" />
          <button className="relative bg-transparent border cursor-pointer border-[#491eb3] rounded-full p-3 hover:bg-[#491eb3]/30 transition-all duration-300 backdrop-blur-sm">
            <MessageCircle className="w-6 h-6 text-purple-400" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
