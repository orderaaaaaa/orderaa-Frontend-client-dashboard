import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Else, If, Then } from 'react-if';
import { IntegrationCardProps } from '../types/platformAndIntegrationCard';

export const IntegrationCard = ({
  platform,
  onButtonClick,
  webhookConfig,
}: IntegrationCardProps) => {
  const isConnected =
    platform.id === 'easyorder' && webhookConfig && webhookConfig.isActive;

  return (
    <div className="relative bg-white rounded-2xl p-8 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md">
      {isConnected && (
        <div className="absolute top-4 left-4 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          متصل
        </div>
      )}

      <div className="flex justify-center mb-6 mt-2">
        <div className="w-32 h-32 flex items-center justify-center">
          <Image
            src={platform.logo}
            alt={`${platform.name} logo`}
            width={128}
            height={128}
            className="object-contain"
          />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
        ربط {platform.name}
      </h3>

      <p className="text-center text-gray-600 mb-6">{platform.description}</p>

      <Button
        onClick={() => platform.isActive && onButtonClick(platform.id)}
        className={`
          w-full h-12 rounded-lg font-medium text-white transition-all duration-200
          ${
            platform.isActive
              ? isConnected
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-[#5D24E1] hover:bg-[#4A1CB8] active:bg-[#3D17A0]'
              : 'bg-gray-400 cursor-not-allowed'
          }
        `}
        disabled={!platform.isActive}
      >
        <If condition={platform.isActive}>
          <Then>{isConnected ? 'إدارة الربط' : platform.buttonText}</Then>
          <Else>قريباً</Else>
        </If>
      </Button>
    </div>
  );
};
