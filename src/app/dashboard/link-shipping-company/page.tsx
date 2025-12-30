'use client';
import { useState } from 'react';
import { IntegrationCard } from './components/IntegrationCard';
import { ShippingIntegrationModal } from './components/ShippingIntegrationModal';
import { providers } from './constants/providers';
import { useShippingQuery } from './hooks/useShippingQuery';

export default function ShippingIntegrationsPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const { configs, isLoading } = useShippingQuery();

  return (
    <div className="p-8 container mx-auto bg-gray-50 min-h-screen" dir="rtl">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-8 bg-[#5D24E1] rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900">شركات الشحن</h1>
        </div>
        <p className="text-gray-600 text-lg mr-6">
          قم بربط متجرك مع شركات الشحن لتلقي تحديثات الحالات تلقائياً
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          جاري التحميل...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((provider) => {
            // Find config for this specific provider
            const providerConfig = configs.find(
              (c: any) =>
                c.shippingCompany?.toUpperCase() === provider.id.toUpperCase()
            );

            return (
              <IntegrationCard
                key={provider.id}
                provider={provider}
                config={providerConfig} // Pass the found config
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
