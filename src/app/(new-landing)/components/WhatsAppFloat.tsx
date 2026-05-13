'use client';

import { motion } from 'framer-motion';
import { LiaWhatsapp } from 'react-icons/lia';

const WHATSAPP_NUMBER = '201283337434';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function WhatsAppFloat() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      initial={{ opacity: 0, y: 24, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group fixed bottom-5 left-5 z-[60] flex items-center justify-center rounded-full bg-[#25D366] p-3 text-white shadow-[0_10px_40px_-10px_rgba(37,211,102,0.6)] ring-1 ring-white/10 transition-[padding,box-shadow] duration-300 hover:px-5 hover:shadow-[0_14px_50px_-10px_rgba(37,211,102,0.8)] sm:bottom-7 sm:left-7 sm:p-3.5"
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
    </motion.a>
  );
}
