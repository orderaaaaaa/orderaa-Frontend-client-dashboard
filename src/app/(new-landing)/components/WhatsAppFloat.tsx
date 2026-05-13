'use client';

import { LiaWhatsapp } from 'react-icons/lia';

const WHATSAPP_NUMBER = '201283337434';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      style={{ animationDelay: '0.6s' }}
      className="group fixed bottom-5 left-5 z-[60] flex items-center justify-center rounded-full bg-[#25D366] p-3 text-white shadow-[0_10px_40px_-10px_rgba(37,211,102,0.6)] ring-1 ring-white/10 transition-[padding,box-shadow,scale] duration-300 hover:scale-105 hover:px-5 hover:shadow-[0_14px_50px_-10px_rgba(37,211,102,0.8)] active:scale-95 sm:bottom-7 sm:left-7 sm:p-3.5 nl-anim-fade-in-up"
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-70 animate-ping"
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full bg-[#25D366]"
      />

      <LiaWhatsapp className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />

      <span className="grid grid-cols-[0fr] overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:grid-cols-[1fr] group-hover:pl-2 group-hover:opacity-100">
        <span className="min-w-0">تواصل واتساب</span>
      </span>
    </a>
  );
}
