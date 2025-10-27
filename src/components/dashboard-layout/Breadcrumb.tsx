import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getBreadcrumb } from '@/lib/utils';
interface BreadcrumbProps {
  className?: string;
}

// Omar TODO: Import from a common utility file

export function Breadcrumb({ className = '' }: BreadcrumbProps) {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div
      className={`flex items-center gap-2 text-base lg:text-lg font-semibold text-gray-800 p-5 ${className} max-sm:hidden`}
      style={{ direction: 'rtl' }}
    >
      <span className="text-[#5D24E1]">{breadcrumb.parent}</span>
      {breadcrumb.child && (
        <>
          <ArrowLeft
            className="h-4 w-4 opacity-60"
            color="#292D32"
            width={15}
            height={15}
          />
          <span className="font-normal text-gray-700">{breadcrumb.child}</span>
        </>
      )}
    </div>
  );
}
