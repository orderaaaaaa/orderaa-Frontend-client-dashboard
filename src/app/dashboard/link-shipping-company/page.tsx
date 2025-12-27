'use client';
import { useState } from 'react';
import { IntegrationCard } from './components/IntegrationCard';
import { ShippingIntegrationModal } from './components/ShippingIntegrationModal';
import { providers } from './constants/providers';

export default function ShippingIntegrationsPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {providers.map((provider) => (
          <IntegrationCard
            key={provider.id}
            provider={provider}
            onConnect={() => setSelectedProvider(provider.id)}
          />
        ))}
      </div>

      <ShippingIntegrationModal
        isOpen={!!selectedProvider}
        providerId={selectedProvider || ''}
        onClose={() => setSelectedProvider(null)}
      />
    </div>
  );
}
