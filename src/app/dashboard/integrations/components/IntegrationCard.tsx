import { Button } from '@/components/ui/button';
import { LiaCheckCircleSolid } from 'react-icons/lia';
import Image from 'next/image';
import { Else, If, Then } from 'react-if';
import { IntegrationCardProps } from '../types/platformAndIntegrationCard';
import { useMemo } from 'react';
import clsx from 'clsx';
import groupBy from 'lodash/groupBy';

export const IntegrationCard = ({
  platform,
  onButtonClick,
  integrations,
}: IntegrationCardProps) => {
  const providerIntegrations = useMemo(() => {
    return integrations?.filter((item) => item.provider === platform.providerKey) || [];
  }, [integrations, platform.providerKey]);

  const hasConnection = useMemo(() => {
    return providerIntegrations.some((item) => item.isActive);
  }, [providerIntegrations]);

  const storeCount = useMemo(() => {
    return Object.keys(groupBy(providerIntegrations, 'storeId')).length;
  }, [providerIntegrations]);

  return (
    <div className="relative bg-white rounded-2xl p-8 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md flex flex-col">
      {storeCount > 0 && (
        <div className="absolute top-4 left-4">
          <div className="bg-green-100 text-green-700 text-sm font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <LiaCheckCircleSolid className="w-4 h-4" />
            {storeCount} {storeCount === 1 ? 'متجر متصل' : 'متاجر متصلة'}
          </div>
        </div>
      )}

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

      <p className="text-center text-gray-600 mb-6 flex-1">{platform.description}</p>

      <Button
        onClick={() => platform.isActive && onButtonClick(platform.id)}
        className={clsx(
          'w-full h-12 rounded-lg font-medium text-white transition-all duration-200',
          platform.isActive
            ? hasConnection
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-primary hover:bg-[#4A1CB8] active:bg-[#3D17A0]'
            : 'bg-gray-400 cursor-not-allowed'
        )}
        disabled={!platform.isActive}
      >
        <If condition={platform.isActive}>
          <Then>
            {hasConnection ? 'إدارة الربط' : platform.buttonText}
          </Then>
          <Else>قريباً</Else>
        </If>
      </Button>
    </div>
  );
};
