'use client';

import Link from 'next/link';
import { LiaCogSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import TrackingTabs from './TrackingTabs';

export default function TrackingBoardContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">متابعة الشحن</h1>
        <Link href="/dashboard/store-settings">
          <Button variant="ghost" size="icon">
            <LiaCogSolid className="size-5" />
          </Button>
        </Link>
      </div>
      <TrackingTabs />
    </div>
  );
}
