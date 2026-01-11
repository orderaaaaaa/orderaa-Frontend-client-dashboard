import { FaArrowTrendUp, FaPlus } from 'react-icons/fa6';

interface StoresStateCardProps {
  title: string;
  value: number | string;
  statsValue: string;
  Icon: React.ComponentType<{ className?: string }>;
}

function StoresStateCard({
  title,
  value,
  statsValue,
  Icon,
}: StoresStateCardProps) {
  return (
    <div className="px-4 py-6 border-2 bg-[#ffffff] border-[#e5dcfa] rounded-lg flex gap-3 shadow-md shadow-[#f5f4f4]">
      <div>
        <div className="w-10 h-10 rounded-full border border-primary bg-[#f9f6fe] flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>{' '}
      </div>
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold">{title}</h3>

        <p className="font-semibold text-3xl text-primary">{value}</p>

        <p className="flex items-center gap-2 text-lg text-green-500">
          <FaArrowTrendUp className="w-4 h-4" />

          <span className="flex items-center gap-1">
            <FaPlus className="w-2.5 h-2.5" />
            <span>{statsValue}</span>
          </span>
        </p>
      </div>
    </div>
  );
}

export default StoresStateCard;
