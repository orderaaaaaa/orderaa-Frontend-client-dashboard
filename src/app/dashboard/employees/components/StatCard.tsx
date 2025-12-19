// components/StatCard.tsx
import { SvgIcon } from '@/components/ui/svg-icon'; // Adjust path as needed
import { StatCardProps } from '../types/stat.types';

export const StatCard = ({
  title,
  count,
  iconBgColor,
  iconPath,
  alt = title,
  borderColor,
}: StatCardProps) => {
  return (
    <div
      className={`bg-white max-sm:cursor-grab max-sm:active:cursor-grabbing p-6 rounded-lg sm:shadow-lg border-2 border-solid ${
        borderColor ?? 'border-gray-200'
      }`}
    >
      <div className="grid grid-cols-[50px_1fr] gap-5">
        <div
          className={`${iconBgColor} p-3 rounded-lg h-[50px] shadow-lg border-2 ${
            borderColor ?? 'border-gray-200'
          }`}
        >
          <SvgIcon src={iconPath} className="h-6 w-6" alt={alt} />
        </div>
        <div>
          <p className="text-[#00000099] text-2xl">{title}</p>
          <p className="text-3xl mt-2">{count}</p>
        </div>
      </div>
    </div>
  );
};
