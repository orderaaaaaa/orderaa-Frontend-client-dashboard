import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const FIRST_ITEM_CLASSES =
  'text-primary font-bold text-xl md:text-3xl transition-all hover:opacity-80';

const SECONDARY_ITEM_CLASSES =
  'font-normal text-lg md:text-xl text-foreground-heading transition-all hover:text-primary';

function findBackItem(items: BreadcrumbItem[]) {
  for (let index = items.length - 2; index >= 0; index -= 1) {
    if (items[index].href) return items[index];
  }
  return undefined;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  const lastItem = items[items.length - 1];
  const backItem = findBackItem(items);
  const showOnMobile = Boolean(lastItem.href || backItem);

  return (
    <>
      {showOnMobile && (
        <div
          className={`flex md:hidden items-center gap-2 font-semibold ${className}`}
          style={{ direction: 'rtl' }}
        >
          {backItem && (
            <>
              <Link
                href={backItem.href as string}
                className={`${SECONDARY_ITEM_CLASSES} flex items-center gap-1`}
              >
                <ArrowRight className="h-4 w-4 shrink-0 text-icon-neutral" />
                {backItem.title}
              </Link>
              <span aria-hidden="true" className="text-icon-neutral">
                /
              </span>
              <span aria-current="page" className={SECONDARY_ITEM_CLASSES}>
                {lastItem.title}
              </span>
            </>
          )}
          {!backItem && lastItem.href && (
            <Link href={lastItem.href} className={SECONDARY_ITEM_CLASSES}>
              {lastItem.title}
            </Link>
          )}
        </div>
      )}

      <div
        className={`hidden md:flex items-center gap-2 font-semibold ${className}`}
        style={{ direction: 'rtl' }}
      >
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const itemClasses = isFirst
            ? FIRST_ITEM_CLASSES
            : SECONDARY_ITEM_CLASSES;

          return (
            <div key={index} className="flex items-center gap-2">
              {item.href ? (
                <Link href={item.href} className={itemClasses}>
                  {item.title}
                </Link>
              ) : (
                <span className={itemClasses}>{item.title}</span>
              )}

              {!isLast && (
                <ArrowLeft
                  className="h-4 w-4 shrink-0 text-icon-neutral"
                  color="currentColor"
                  width={15}
                  height={15}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
