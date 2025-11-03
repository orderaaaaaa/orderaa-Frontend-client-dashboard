import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

function Header() {
  return (
    <section className="container mx-auto m-0 p-0 text-white">
      <div className="flex justify-between py-6">
        <Image
          src={'/icons/Orderaa.svg'}
          alt=""
          width={70}
          height={10}
          className="w-full max-w-[160px]"
        />
        <div>
          <ul className="border-1 border-[#5D24E1] px-12 py-2 rounded-4xl flex gap-10 bg-[#FFFFFF]/4">
            <li>
              <Link href="#">الصفحة الرئيسية</Link>
            </li>
            <li>
              {' '}
              <Link href="#">الباقات</Link>
            </li>
            <li>
              {' '}
              <Link href="#">الخدمات</Link>
            </li>
          </ul>
        </div>

        <div className="space-x-3">
          <Link
            href="/signup"
            className="border-1 border-[#5D24E1] py-2 px-3 rounded-4xl bg-[#FFFFFF]/4"
          >
            {' '}
            تسجيل الحساب{' '}
          </Link>
          <Link
            href="/signin"
            className="border-1 border-[#5D24E1] py-2 px-3 rounded-4xl bg-[#FFFFFF]/4"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Header;
