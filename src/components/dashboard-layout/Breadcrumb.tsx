import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  title: string;
  href?: string; // If no href, it's treated as the current page (text only)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={`flex items-center gap-2 text-base lg:text-lg font-semibold text-gray-800 ${className} max-sm:hidden`}
      style={{ direction: 'rtl' }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = item.href && !isLast;

        return (
          <div key={index} className="flex items-center gap-2">
            {isClickable && item.href ? (
              <Link
                href={item.href}
                className="text-[#5D24E1] transition-all font-bold text-3xl"
              >
                {item.title}
              </Link>
            ) : (
              <span
                className={
                  index === 0
                    ? 'text-[#5D24E1]'
                    : 'font-normal text-xl text-[#1F1F1F]'
                }
              >
                {item.title}
              </span>
            )}

            {!isLast && (
              <ArrowLeft
                className="h-4 w-4 "
                color="#292D32"
                width={15}
                height={15}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
