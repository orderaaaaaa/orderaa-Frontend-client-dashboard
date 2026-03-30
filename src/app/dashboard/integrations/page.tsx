'use client';

import React, { useState } from 'react';
import IntegrationModal from './components/IntegrationModal';
import EditIntegrationModal from './components/EditIntegrationModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { platforms } from './constants/platforms';
import { providerConfigs } from './constants/providerConfig';
import { IntegrationCard } from './components/IntegrationCard';
import { Notification } from './components/Notification';
import { useIntegrations } from './hooks/useIntegrations';
import { IntegrationResponse } from './types/apiIntegration';
import { toast } from 'react-toastify';

const IntegrationsPage = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [editingStore, setEditingStore] = useState<{
    storeId: number;
    configs: IntegrationResponse[];
  } | null>(null);

  const [deletingStore, setDeletingStore] = useState<{
    storeId: number;
    storeName: string;
  } | null>(null);

  const {
    integrations,
    isLoading,
    deleteIntegration,
    deleteStore,
    isStoreDeletePending,
  } = useIntegrations();

  const handleCardButtonClick = (platformId: string) => {
    if (providerConfigs[platformId]) {
      setActiveModal(platformId);
    }
  };

  const handleModalSuccess = () => {
    setNotification({
      message: 'تم إنشاء الربط بنجاح! سيتم استقبال الطلبات تلقائياً الآن.',
      type: 'success',
    });
  };

  const handleEditStore = (storeId: number, configs: IntegrationResponse[]) => {
    setEditingStore({ storeId, configs });
  };

  const handleDeleteStore = (storeId: number, storeName: string) => {
    setDeletingStore({ storeId, storeName });
  };

  const handleConfirmDelete = async () => {
    if (!deletingStore) return;

    try {
      const storeConfigs = integrations?.filter(
        (c) => c.storeId === deletingStore.storeId
      ) || [];

      for (const config of storeConfigs) {
        await deleteIntegration(config.id);
      }

      await deleteStore(deletingStore.storeId);
      toast.success('تم حذف المتجر بنجاح');
      setDeletingStore(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const getProviderConfigForStore = (configs: IntegrationResponse[]) => {
    const provider = configs[0]?.provider;
    return Object.values(providerConfigs).find((c) => c.provider === provider);
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
                  integrations={integrations}
                  onButtonClick={handleCardButtonClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {activeModal && providerConfigs[activeModal] && (
        <IntegrationModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onSuccess={handleModalSuccess}
          config={providerConfigs[activeModal]}
          onEditStore={handleEditStore}
          onDeleteStore={handleDeleteStore}
        />
      )}

      {editingStore && (
        <EditIntegrationModal
          isOpen={true}
          onClose={() => setEditingStore(null)}
          storeId={editingStore.storeId}
          configs={editingStore.configs}
          providerConfig={getProviderConfigForStore(editingStore.configs)}
        />
      )}

      {deletingStore && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeletingStore(null)}
          onConfirm={handleConfirmDelete}
          storeName={deletingStore.storeName}
          isLoading={isStoreDeletePending}
        />
      )}

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
