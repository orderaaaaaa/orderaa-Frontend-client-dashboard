'use client';

import React from 'react';

interface TrackingEmptyStateProps {
  message: string;
  icon: React.ReactNode;
}

export default function TrackingEmptyState({ message, icon }: TrackingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-lg">{message}</p>
    </div>
  );
}
