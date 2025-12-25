import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShippingProvider } from '../types/shipping';
import { StatusBadge } from './StatusBadge';
import { useShippingQuery } from '../hooks/useShippingQuery';

interface IntegrationCardProps {
  provider: ShippingProvider;
  onConnect: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  provider,
  onConnect,
}) => {
  const { config } = useShippingQuery(provider.id);
  const isConnected = config?.isEnabled || false;

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 flex flex-col items-center text-center transition-all hover:border-[#5d24e1]/20 hover:shadow-sm">
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center bg-gray-50 rounded-full overflow-hidden p-4">
        <Image
          src={provider.logo}
          alt={provider.name}
          width={80}
          height={80}
          className="object-contain"
        />
      </div>

      <div className="mb-2">
        <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
      </div>

      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        {provider.description}
      </p>

      <div className="w-full mt-auto space-y-4">
        <StatusBadge isConnected={isConnected} />

        <Button
          onClick={onConnect}
          variant={isConnected ? 'outline' : 'default'}
          className={`w-full h-12 rounded-xl font-bold transition-all ${
            !isConnected
              ? 'bg-[#5d24e1] hover:bg-[#4a1cb5] text-white'
              : 'border-gray-200 text-gray-700'
          }`}
        >
          {isConnected ? 'تعديل الإعدادات' : 'إنشاء ربط جديد'}
        </Button>
      </div>
    </div>
  );
};
