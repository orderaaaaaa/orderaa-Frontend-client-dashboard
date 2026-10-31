import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { ShippingConfig, ShippingProvider } from '../types/shipping';
import { LiaCheckCircleSolid } from 'react-icons/lia';
import { LocationSyncNotice } from '@/components/shipping/LocationSyncNotice';
import { useLocationSyncRetry } from '@/services/shippingLocationSync';
import { useI18n } from '@/i18n/I18nProvider';

interface IntegrationCardProps {
  provider: ShippingProvider;
  config?: ShippingConfig;
  onConnect: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  provider,
  config,
  onConnect,
}) => {
  const { t } = useI18n();
  const isConnected = config?.isActive ?? false;
  const canInteract = provider.isActive;
  const isDisabled = !canInteract;
  const syncRetry = useLocationSyncRetry(config?.shippingCompany);

  const getButtonText = () => {
    if (!canInteract) return t('canonical.shipping.integration.soon');
    return isConnected ? t('canonical.shipping.integration.manage') : t('canonical.shipping.integration.create');
  };

  return (
    <div className="relative bg-card rounded-2xl p-5 sm:p-8 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md flex flex-col min-h-0 sm:min-h-[400px]">
      {isConnected && canInteract && (
        <div className="absolute top-4 left-4 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
          <LiaCheckCircleSolid className="w-3 h-3" />
          {t('canonical.shipping.integration.connected')}
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
            unoptimized
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
        {t('canonical.shipping.integration.title', { name: provider.name })}
      </h3>

      {/* Description */}
      <p className="text-center text-gray-600 mb-6">{provider.description}</p>

      {isConnected && canInteract && config?.locationSync && (
        <div className="mb-4 flex justify-center text-center">
          <LocationSyncNotice sync={config.locationSync} retry={syncRetry} />
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={onConnect}
        disabled={isDisabled}
        className={clsx(
          'w-full h-12 rounded-lg font-medium text-white transition-all duration-200 mt-auto',
          canInteract
            ? isConnected
              ? 'bg-gray-500 hover:brightness-90'
              : 'bg-primary hover:bg-brand-hover active:bg-[#3D17A0]'
            : 'bg-gray-400 cursor-not-allowed'
        )}
      >
        {getButtonText()}
      </Button>
    </div>
  );
};
