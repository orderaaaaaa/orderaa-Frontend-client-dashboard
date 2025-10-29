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
  // Check if it's an SVG file
  const isSvg = src.toLowerCase().endsWith('.svg');

  if (isSvg) {
    // For SVG files, use a regular img tag to avoid Next.js Image optimization issues
    return (
      <div className={className}>
        <img src={src} alt={alt} className="w-full h-full" />
      </div>
    );
  }

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
