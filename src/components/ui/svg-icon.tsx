import Image from 'next/image';
import React from 'react';

interface SvgIconProps {
  src: string;
  className?: string;
  alt?: string;
}

// Main SvgIcon component
export function SvgIcon({
  src,
  className = 'h-5 w-5',
  alt = 'icon',
}: SvgIconProps) {
  return (
    <div className={className}>
      <Image
        src={src}
        alt={alt}
        width={20}
        height={20}
        className="w-full h-full"
      />
    </div>
  );
}

// Reusable factory function to create custom icons
export function createIcon(src: string, alt?: string) {
  return function CustomIcon({
    className = 'h-5 w-5',
  }: {
    className?: string;
  }) {
    return <SvgIcon src={src} className={className} alt={alt} />;
  };
}
