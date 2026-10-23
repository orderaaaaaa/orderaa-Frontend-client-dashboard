'use client';

import { Suspense } from 'react';
import { OpeningCountContent } from '../components/OpeningCountContent';

export default function OpeningCountPage() {
  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden p-4">
      <Suspense fallback={null}>
        <OpeningCountContent />
      </Suspense>
    </div>
  );
}
