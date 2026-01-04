'use client';

import React, { useState, useEffect } from 'react';
import EasyOrderModal from './components/EasyOrderModal';
import { webhookApi, WebhookConfigResponse } from '@/lib/api/webhooks';
import { platforms } from './constants/platforms';
import { IntegrationCard } from './components/IntegrationCard';
import { Notification } from './components/Notification';
import { useGetWebhookConfig } from './hooks/useGetWebhookConfig';
import { useIntegrations } from './hooks/useIntegrations';

const IntegrationsPage = () => {
  const [isEasyOrderModalOpen, setIsEasyOrderModalOpen] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const { data: easyData, isLoading: isLoadingWebHook } = useGetWebhookConfig();
  const { integrations } = useIntegrations();

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
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              <h1 className="text-3xl font-bold text-gray-900">ربط المنصات</h1>
            </div>
            <p className="text-gray-600 text-lg mr-6">
              قم بربط متجرك لمزامنة الطلبات تلقائياً عبر Webhooks
            </p>
          </div>

          {isLoadingWebHook ? (
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
                  integrations={integrations}
                  onButtonClick={handleCardButtonClick}
                  webhookConfig={easyData}
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
        existingConfig={easyData}
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
