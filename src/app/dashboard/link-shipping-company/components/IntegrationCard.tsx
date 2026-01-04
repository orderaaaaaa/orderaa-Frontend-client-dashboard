import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShippingProvider } from '../types/shipping';
import { CheckCircle2 } from 'lucide-react';

interface IntegrationCardProps {
  provider: ShippingProvider;
  config?: any; // Config received from parent
  onConnect: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  provider,
  config,
  onConnect,
}) => {
  // Use the passed config to determine connection status
  const isConnected = config?.isActive ?? false;

  return (
    <div className="relative bg-white rounded-2xl p-8 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md">
      {isConnected && (
        <div className="absolute top-4 left-4 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          متصل
        </div>
      )}

      {/* Logo */}
      <div className="flex justify-center mb-6 mt-2">
        <div className="w-32 h-32 flex items-center justify-center">
          <Image
            src={provider.logo}
            alt={provider.name}
            width={128}
            height={128}
            className="object-contain"
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
        ربط {provider.name}
      </h3>

      {/* Description */}
      <p className="text-center text-gray-600 mb-6">{provider.description}</p>

      {/* Action Button */}
      <Button
        onClick={onConnect}
        disabled={!provider.isActive}
        className={`
          w-full h-12 rounded-lg font-medium text-white transition-all duration-200
          ${provider.isActive
            ? isConnected
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-primary hover:bg-[#4A1CB8] active:bg-[#3D17A0]'
            : 'bg-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isConnected
          ? 'إدارة الربط'
          : provider.isActive
            ? 'إنشاء ربط جديد'
            : 'قريباً'}
      </Button>
    </div>
  );
};
