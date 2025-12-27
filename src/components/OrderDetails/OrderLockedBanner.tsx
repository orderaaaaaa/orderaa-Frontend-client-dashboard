import { LiaExclamationTriangleSolid } from 'react-icons/lia';
import { OrderLockedBy } from '@/types/orders';

interface OrderLockedBannerProps {
  lockedBy: OrderLockedBy;
}

export default function OrderLockedBanner({ lockedBy }: OrderLockedBannerProps) {
  return (
    <div className="relative bg-[#F6F2FC] border border-[#CBB5FD] rounded-full max-xl:rounded-l-3xl p-2 px-4">
      <h3 className="flex gap-2 text-sm items-center font-semibold text-[#5D24E1]">
        <LiaExclamationTriangleSolid className="w-5 h-5 text-[#5D24E1]" />
        الطلب مفتوح من قبل {lockedBy.name} في قسم {lockedBy.department}
      </h3>
    </div>
  );
}
