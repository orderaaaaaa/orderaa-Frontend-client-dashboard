import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface StockPageBreadcrumb {
  label: string;
  href?: string;
}

interface StockPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs: StockPageBreadcrumb[];
  actions?: ReactNode;
}

export function StockPageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: StockPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 space-y-1">
        {breadcrumbs.length > 0 && (
          <nav aria-label="مسار التنقل">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <li
                  key={`${crumb.label}-${index}`}
                  className="flex items-center gap-1"
                >
                  {index > 0 && (
                    <ChevronLeft className="size-3 shrink-0" aria-hidden="true" />
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="break-words text-2xl font-bold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
