import Image from 'next/image';
import React from 'react';
import { string } from 'zod';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col justify-center items-center">
      <Image src="/images/logo.png" alt="logo" width={323} height={50} />

      <div className="flex flex-col justify-center items-center gap-3">
        <p className="font-bold text-[#212529] text-[30px]">{title}</p>

        <p className="font-medium text-[#878A99] text-[22px]">{subtitle}</p>
      </div>
    </div>
  );
}
