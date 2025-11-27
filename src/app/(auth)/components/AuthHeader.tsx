import Image from 'next/image';
import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col justify-center items-center">
      <Image src="/images/logo.JPG" alt="logo" width={200} height={50} />

      <div className="flex flex-col justify-center items-center gap-1">
        <p className="font-bold text-[#212529] text-[25px]">{title}</p>

        <p className="font-medium text-[#878A99] text-[20px]">{subtitle}</p>
      </div>
    </div>
  );
}
