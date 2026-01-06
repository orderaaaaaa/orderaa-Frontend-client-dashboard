'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react'; // For hamburger Icons
import { Assets } from './assets';

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="container mx-auto px-4 text-white">
      <div className="flex justify-between items-center py-6">
        {/* Logo */}
        <Link href="/">
          <img
            src={Assets.Orderaa.src}
            alt="Orderaa logo"
            width={120}
            height={40}
            className="max-w-[160px]"
          />

        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 bg-[#FFFFFF]/10 border border-[#5D24E1] px-10 py-2 rounded-3xl">
          <Link href="#">الصفحة الرئيسية</Link>
          <Link href="#pricing">الباقات</Link>
          <Link href="#features">الخدمات</Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/signup"
            className="border border-[#5D24E1] py-2 px-4 rounded-3xl bg-[#FFFFFF]/10"
          >
            تسجيل الحساب
          </Link>
          <Link
            href="/signin"
            className="border border-[#5D24E1] py-2 px-4 rounded-3xl bg-[#FFFFFF]/10"
          >
            تسجيل الدخول
          </Link>
        </div>

        {/* Mobile Burger */}
        <button
          className="md:hidden border border-[#5D24E1] p-2 rounded-2xl bg-[#FFFFFF]/10"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center gap-5 py-6 bg-[#1A1A1A]/90 border-t border-[#5D24E1] rounded-b-2xl">
          <Link href="#" onClick={() => setIsOpen(false)}>
            الصفحة الرئيسية
          </Link>
          <Link href="#" onClick={() => setIsOpen(false)}>
            الباقات
          </Link>
          <Link href="#" onClick={() => setIsOpen(false)}>
            الخدمات
          </Link>
          <div className="flex flex-col gap-3 w-full items-center">
            <Link
              href="/signup"
              className="border border-[#5D24E1] py-2 px-4 rounded-3xl bg-[#FFFFFF]/10 w-3/4 text-center"
              onClick={() => setIsOpen(false)}
            >
              تسجيل الحساب
            </Link>
            <Link
              href="/signin"
              className="border border-[#5D24E1] py-2 px-4 rounded-3xl bg-[#FFFFFF]/10 w-3/4 text-center"
              onClick={() => setIsOpen(false)}
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
