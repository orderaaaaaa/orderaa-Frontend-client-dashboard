import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { navigation } from '@/constants/Navbar';

interface BreadcrumbProps {
  className?: string;
}

// Omar TODO: Import from a common utility file
function getBreadcrumb(pathname: string) {
  for (const item of navigation) {
    if (item.children) {
      const child = item.children.find((c) => pathname.startsWith(c.href));
      if (child) {
        return { parent: item.name, child: child.name };
      }
    }
    if (pathname === item.href) {
      return { parent: item.name, child: null as string | null };
    }
  }
  const parent = navigation.find((n) => pathname.startsWith(n.href));
  return {
    parent: parent?.name ?? 'لوحة التحكم',
    child: null as string | null,
  };
}

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
