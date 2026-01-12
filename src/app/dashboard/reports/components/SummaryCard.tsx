import { ArrowUp } from 'lucide-react';
import { SummaryCardConst } from '@/constants/customer-service/TapAndSummary';

interface ISummaryCardProp {
  percentage?: number;
  title: string;
  desc?: string;
  data: number;
}

export default function SummaryCard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-6 w-[95%]">
      {SummaryCardConst.map(({ id, data, title, desc, percentage }) => (
        <div
          key={id}
          className="flex flex-col gap-2 p-8 border-2 min-w-[300px] bg-[#f9f9fb]  rounded-3xl shadow-md w-full"
        >
          <h1 className="text-primary font-medium text-[25px]">{title}</h1>
          <div className="flex gap-2 items-center font-semibold text-[24px]">
            {data}
            {percentage && (
              <span className="flex gap-1 items-center text-[#3CC900] text-[16px]">
                <ArrowUp />({percentage}%)
              </span>
            )}
          </div>
          <p className="font-light">{desc}</p>
        </div>
      ))}
    </div>
  );
}
