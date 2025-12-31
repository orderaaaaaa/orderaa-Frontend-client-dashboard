import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  // Check if the second item (index 1) has an href
  const hasSecondItemHref = items[1]?.href;

  return (
    <div
      // On mobile: Hide if second item has no href. On PC: Always show.
      className={`${
        hasSecondItemHref ? 'flex' : 'hidden'
      } md:flex items-center gap-2 font-semibold ${className}`}
      style={{ direction: 'rtl' }}
    >
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        const firstItemClasses =
          'text-[#5D24E1] font-bold text-xl md:text-3xl transition-all hover:opacity-80';

        const secondaryItemClasses =
          'font-normal text-lg md:text-xl text-[#1F1F1F] transition-all hover:text-[#5D24E1]';

        return (
          <div key={index} className="flex items-center gap-2">
            {/* The Text Content */}
            <div className={isFirst ? 'hidden md:block' : 'block'}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={isFirst ? firstItemClasses : secondaryItemClasses}
                >
                  {item.title}
                </Link>
              ) : (
                <span
                  className={isFirst ? firstItemClasses : secondaryItemClasses}
                >
                  {item.title}
                </span>
              )}
            </div>

            {/* The Arrow: Always show if not last item */}
            {!isLast && (
              <ArrowLeft
                className="h-4 w-4 shrink-0"
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
