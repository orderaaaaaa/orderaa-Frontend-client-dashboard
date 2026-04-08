'use client';

import TrackingTabs from './TrackingTabs';

export default function TrackingBoardContent() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">متابعة الشحن</h1>
      <TrackingTabs />
    </div>
  );
}
