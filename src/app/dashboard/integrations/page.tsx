'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import EasyOrderModal from './EasyOrderModal';
import { webhookApi, WebhookConfigResponse } from '@/lib/api/webhooks';
import { Button } from '@/components/ui/button';
import { Else, If, Then } from 'react-if';

interface IntegrationPlatform {
  name: string;
  logo: string;
  description: string;
  buttonText: string;
  isActive: boolean;
  id: string;
}

const platforms: IntegrationPlatform[] = [
  {
    id: 'easyorder',
    name: 'Easy Order',
    logo: '/integrations/easyorder.svg',
    description: 'ربط متجرك بمنصة Easy Order',
    buttonText: 'إنشاء ربط جديد',
    isActive: true,
  },
  {
    id: 'shopify',
    name: 'Shopify',
    logo: '/integrations/shopify.svg',
    description: 'ربط متجرك بمنصة Shopify',
    buttonText: 'إنشاء ربط جديد',
    isActive: false,
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    logo: '/integrations/wordpress.svg',
    description: 'ربط متجرك بمنصة WordPress',
    buttonText: 'إنشاء ربط جديد',
    isActive: false,
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    logo: '/integrations/woocommerce.svg',
    description: 'ربط متجرك بمنصة WooCommerce',
    buttonText: 'إنشاء ربط جديد',
    isActive: false,
  },
];

interface IntegrationCardProps {
  platform: IntegrationPlatform;
  onButtonClick: (platformId: string) => void;
  webhookConfig: WebhookConfigResponse | null;
}

const IntegrationCard = ({
  platform,
  onButtonClick,
  webhookConfig,
}: IntegrationCardProps) => {
  const isConnected =
    platform.id === 'easyorder' && webhookConfig && webhookConfig.isActive;

  return (
    <div
      className={`
        relative bg-white rounded-2xl p-8 transition-all duration-300
        ${
          platform.isActive
            ? 'border-2 border-[#5D24E1] shadow-lg shadow-purple-100'
            : 'border border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
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

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification = ({ message, type, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transition-all ${
        type === 'success'
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}
      dir="rtl"
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600" />
      )}
      <span
        className={`font-medium ${
          type === 'success' ? 'text-green-900' : 'text-red-900'
        }`}
      >
        {message}
      </span>
    </div>
  );
};

const IntegrationsPage = () => {
  const [isEasyOrderModalOpen, setIsEasyOrderModalOpen] = useState(false);
  const [webhookConfig, setWebhookConfig] =
    useState<WebhookConfigResponse | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWebhookConfig();
  }, []);

  const loadWebhookConfig = async () => {
    try {
      const config = await webhookApi.getConfig();
      setWebhookConfig(config);
    } catch (error: any) {
      if (error.response?.status !== 404) {
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardButtonClick = (platformId: string) => {
    if (platformId === 'easyorder') {
      setIsEasyOrderModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsEasyOrderModalOpen(false);
  };

  const handleModalSuccess = () => {
    setNotification({
      message: 'تم إنشاء الربط بنجاح! سيتم استقبال الطلبات تلقائياً الآن.',
      type: 'success',
    });
    loadWebhookConfig();
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 bg-[#5D24E1] rounded-full"></div>
              <h1 className="text-3xl font-bold text-gray-900">ربط المنصات</h1>
            </div>
            <p className="text-gray-600 text-lg mr-6">
              قم بربط متجرك لمزامنة الطلبات تلقائياً عبر Webhooks
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-8 border border-gray-200 animate-pulse"
                >
                  <div className="flex justify-center mb-6">
                    <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platforms.map((platform) => (
                <IntegrationCard
                  key={platform.id}
                  platform={platform}
                  onButtonClick={handleCardButtonClick}
                  webhookConfig={webhookConfig}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EasyOrderModal
        isOpen={isEasyOrderModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        existingConfig={webhookConfig}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default IntegrationsPage;
