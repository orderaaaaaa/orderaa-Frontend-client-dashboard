import { LiaExclamationTriangleSolid } from 'react-icons/lia';
import { OrderLockedBy } from '@/types/orders';
import { Button } from '@/components/ui/button';

interface OrderLockedBannerProps {
  lockedBy: OrderLockedBy;
  bypass?: boolean;
  onForceUnlock?: () => void;
  isUnlocking?: boolean;
}

export default function OrderLockedBanner({
  lockedBy,
  bypass,
  onForceUnlock,
  isUnlocking,
}: OrderLockedBannerProps) {
  return (
    <div className="relative bg-[#F6F2FC] border border-[#CBB5FD] rounded-full max-xl:rounded-l-3xl p-2 px-4">
      <h3 className="flex gap-2 text-sm items-center font-semibold text-primary">
        <LiaExclamationTriangleSolid className="w-5 h-5 text-primary" />
        {bypass
          ? `مقفول بواسطة ${lockedBy.name} (تجاوز)`
          : `الطلب مفتوح من قبل ${lockedBy.name} في قسم ${lockedBy.department}`}
        {bypass && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            loading={isUnlocking}
            disabled={isUnlocking}
            onClick={onForceUnlock}
          >
            فك القفل
          </Button>
        )}
      </h3>
    </div>
  );
}
