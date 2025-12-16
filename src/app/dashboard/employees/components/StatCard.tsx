// components/StatCard.tsx
import { SvgIcon } from '@/components/ui/svg-icon'; // Adjust path as needed

interface StatCardProps {
  title: string;
  count: number;
  iconBgColor: string;
  iconPath: string;
  alt?: string;
  borderColor?: string;
}

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
      className={`bg-white p-6 rounded-lg shadow-lg border-2 border-solid ${
        borderColor ?? 'border-gray-200'
      }`}
    >
      <div className="grid grid-cols-[50px_1fr] gap-5 justify-between">
        <div
          className={`${iconBgColor} p-3 rounded-lg h-[50px] shadow-lg border-2 ${
            borderColor ?? 'border-gray-200'
          }`}
        >
          <SvgIcon
            src={iconPath}
            className="h-6 w-6" // Adjust size as needed
            alt={alt}
          />
        </div>
        <div>
          <p className="text-[#00000099] text-2xl">{title}</p>
          <p className="text-2xl font-bold mt-2 text-ce">{count}</p>
        </div>
      </div>
    </div>
  );
};
