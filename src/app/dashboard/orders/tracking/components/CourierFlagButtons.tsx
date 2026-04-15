'use client';

import { LiaCheckCircleSolid, LiaTimesCircleSolid } from 'react-icons/lia';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import type { AgentFlag } from '@/types/logistics';

interface CourierFlagButtonsProps {
  currentFlag: AgentFlag | null;
  onFlag: (flag: AgentFlag) => void;
}

export default function CourierFlagButtons({ currentFlag, onFlag }: CourierFlagButtonsProps) {
  const handleFlag = (flag: AgentFlag) => {
    console.log('[CourierFlag]', { flag });
    onFlag(flag);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className={clsx(
          'gap-1.5',
          currentFlag === 'CORRECT'
            ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
            : 'text-green-600 border-green-300 hover:bg-green-50'
        )}
        onClick={() => handleFlag('CORRECT')}
      >
        <LiaCheckCircleSolid className="size-4" />
        تحديث صحيح
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={clsx(
          'gap-1.5',
          currentFlag === 'FAKE'
            ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100'
            : 'text-red-600 border-red-300 hover:bg-red-50'
        )}
        onClick={() => handleFlag('FAKE')}
      >
        <LiaTimesCircleSolid className="size-4" />
        تحديث مزيف
      </Button>
    </div>
  );
}
