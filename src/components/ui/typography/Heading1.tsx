import React from 'react';

export default function Heading1({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="
      font-bold
      max-sm:text-[15px]
      text-[18px]
    text-[#121212]
      text-ellipsis
      overflow-hidden
      whitespace-nowrap
      max-w-[150px]

    "
    >
      {children}
    </h1>
  );
}
