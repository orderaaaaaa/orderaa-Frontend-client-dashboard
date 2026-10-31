import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  unoptimized?: boolean;
}

export function BrandLogo({ src, alt, width, height, className, unoptimized }: BrandLogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized={unoptimized}
      className={cn('object-contain dark:rounded-md dark:bg-white/90 dark:p-0.5', className)}
    />
  );
}
