'use client';
import { useState, useMemo } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { IntegrationCard } from './components/IntegrationCard';
import { ShippingIntegrationModal } from './components/ShippingIntegrationModal';
import { providers } from './constants/providers';
import { useShippingQuery } from './hooks/useShippingQuery';

export default function ShippingIntegrationsPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const { configs, isLoading } = useShippingQuery();

  const sortedProviders = useMemo(() => {
    return [...providers].sort((a, b) => {
      const aConfig = configs.find(
        (c: any) => c.shippingCompany?.toUpperCase() === a.id.toUpperCase()
      );
      const bConfig = configs.find(
        (c: any) => c.shippingCompany?.toUpperCase() === b.id.toUpperCase()
      );

      const aConnected = aConfig?.isActive ? 1 : 0;
      const bConnected = bConfig?.isActive ? 1 : 0;

      if (aConnected !== bConnected) return bConnected - aConnected;

      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;

      return 0;
    });
  }, [configs]);

  return (
    <div className="p-8 container mx-auto bg-gray-50 min-h-screen" dir="rtl">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900">شركات الشحن</h1>
        </div>
        <p className="text-gray-600 text-lg mr-6">
          قم بربط متجرك مع شركات الشحن لتلقي تحديثات الحالات تلقائياً
        </p>
      </header>

      {isLoading ? (
        <PageLoading className="h-64 mt-10" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProviders.map((provider) => {
            const providerConfig = configs.find(
              (c: any) =>
                c.shippingCompany?.toUpperCase() === provider.id.toUpperCase()
            );

            return (
              <IntegrationCard
                key={provider.id}
                provider={provider}
                config={providerConfig}
                onConnect={() => setSelectedProvider(provider.id)}
              />
            );
          })}
        </div>
      )}

      <ShippingIntegrationModal
        isOpen={!!selectedProvider}
        providerId={selectedProvider || ''}
        initialData={configs.find(
          (c: any) =>
            c.shippingCompany?.toUpperCase() === selectedProvider?.toUpperCase()
        )}
        onClose={() => setSelectedProvider(null)}
      />
    </div>
  );
}
