// components/StatCard.tsx
import { SvgIcon } from '@/components/ui/svg-icon'; // Adjust path as needed

interface StatCardProps {
  title: string;
  count: number;
  iconBgColor: string;
  iconPath: string;
  alt?: string;
}

export const StatCard = ({
  title,
  count,
  iconBgColor,
  iconPath,
  alt = title,
}: StatCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-2">{count}</p>
        </div>
        <div className={`${iconBgColor} p-3 rounded-lg`}>
          <SvgIcon
            src={iconPath}
            className="h-6 w-6" // Adjust size as needed
            alt={alt}
          />
        </div>
      </div>
    </div>
  );
};
