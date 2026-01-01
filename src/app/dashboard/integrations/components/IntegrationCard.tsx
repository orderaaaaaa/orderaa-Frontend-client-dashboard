// components/IntegrationCard.tsx
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Else, If, Then } from 'react-if';
import { IntegrationCardProps } from '../types/platformAndIntegrationCard';
import { useMemo } from 'react';

export const IntegrationCard = ({
  platform,
  onButtonClick,
  webhookConfig,
  integrations,
}: IntegrationCardProps) => {
  const WebhookEasyOrderConnect =
    platform.id === 'easyorder' && webhookConfig && webhookConfig.isActive;

  const isApiConnected = useMemo(() => {
    return integrations?.some(
      (item) => item.provider === platform.providerKey && item.isActive
    );
  }, [integrations]);

  return (
    <div className="relative bg-white rounded-2xl p-8 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md">
      <div className="absolute top-4 left-4 flex gap-2 items-end">
        {WebhookEasyOrderConnect && (
          <div className="bg-green-100 text-green-700 text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            متصل Webhook
          </div>
        )}

        {isApiConnected && (
          <div className="bg-green-100 text-green-700 text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            متصل API
          </div>
        )}
      </div>

      <div className="flex justify-center mb-6 mt-4">
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
              ? WebhookEasyOrderConnect || isApiConnected
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-[#5D24E1] hover:bg-[#4A1CB8] active:bg-[#3D17A0]'
              : 'bg-gray-400 cursor-not-allowed'
          }
        `}
        disabled={!platform.isActive}
      >
        <If condition={platform.isActive}>
          <Then>
            {WebhookEasyOrderConnect || isApiConnected
              ? 'إدارة الربط'
              : platform.buttonText}
          </Then>
          <Else>قريباً</Else>
        </If>
      </Button>
    </div>
  );
};
