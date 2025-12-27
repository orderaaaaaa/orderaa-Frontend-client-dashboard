import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  isConnected: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isConnected }) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-sm font-medium ${
        isConnected
          ? 'bg-green-50 border-green-100 text-green-700'
          : 'bg-gray-50 border-gray-100 text-gray-500'
      }`}
    >
      {isConnected ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span>متصل حالياً</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>غير متصل</span>
        </>
      )}
    </div>
  );
};
