'use client';

import { useMemo, useState } from 'react';
import {
  LiaBoltSolid,
  LiaClockSolid,
  LiaChartLineSolid,
  LiaInfinitySolid,
} from 'react-icons/lia';
import PageLoading from '@/components/ui/page-loading';
import { ProviderCard } from './components/ProviderCard';
import { AutoConfirmationModal } from './components/AutoConfirmationModal';
import { autoConfirmationProviders } from './constants/providers';
import { useAutoConfirmationProviders } from './hooks/useAutoConfirmationProviders';
import { AutoConfirmationProviderId } from './types/autoConfirmation';

export default function AutoConfirmationPage() {
  const [selectedProvider, setSelectedProvider] =
    useState<AutoConfirmationProviderId | null>(null);
  const { configs, findByProvider, isLoading } = useAutoConfirmationProviders();

  const sortedProviders = useMemo(() => {
    return [...autoConfirmationProviders].sort((a, b) => {
      const aConnected = findByProvider(a.id)?.isActive ? 1 : 0;
      const bConnected = findByProvider(b.id)?.isActive ? 1 : 0;
      if (aConnected !== bConnected) return bConnected - aConnected;
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return 0;
    });
  }, [findByProvider, configs]);

  const activeProvider =
    autoConfirmationProviders.find((p) => p.id === selectedProvider) ?? null;
  const activeConfig = selectedProvider
    ? findByProvider(selectedProvider)
    : undefined;

  return (
    <div className="p-8 container mx-auto bg-gray-50 min-h-screen" dir="rtl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900">
            الربط مع شركات التاكيد الالي
          </h1>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(85,33,206,0.15)]">
          <div
            aria-hidden
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 right-0 w-80 h-80 rounded-full bg-fuchsia-300/20 blur-3xl pointer-events-none"
          />

          <div className="relative p-6 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/30 blur-lg rounded-2xl" />
                <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[#3D17A0] text-white shadow-lg">
                  <LiaBoltSolid className="w-7 h-7" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-1">
                  ما هو التأكيد الآلي؟
                </p>
                <p className="text-gray-700 text-base leading-relaxed">
                  خدمات تستخدم الذكاء الاصطناعي للتواصل مع العملاء وتأكيد
                  طلباتهم تلقائياً — اربط متجرك لتوفير وقت فريقك وزيادة نسبة
                  الطلبات المؤكدة.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:flex-nowrap md:gap-3 md:flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-primary/15 text-xs font-medium text-gray-700 shadow-sm">
                <LiaClockSolid className="w-3.5 h-3.5 text-primary" />
                توفير الوقت
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-primary/15 text-xs font-medium text-gray-700 shadow-sm">
                <LiaChartLineSolid className="w-3.5 h-3.5 text-primary" />
                زيادة التأكيد
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-primary/15 text-xs font-medium text-gray-700 shadow-sm">
                <LiaInfinitySolid className="w-3.5 h-3.5 text-primary" />
                عمل 24/7
              </span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <PageLoading className="h-64 mt-10" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProviders.map((provider) => {
            const config = findByProvider(provider.id);
            return (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isConnected={!!config?.isActive}
                onConnect={() => setSelectedProvider(provider.id)}
              />
            );
          })}
        </div>
      )}

      <AutoConfirmationModal
        isOpen={!!selectedProvider}
        provider={activeProvider}
        existingConfig={activeConfig}
        onClose={() => setSelectedProvider(null)}
      />
    </div>
  );
}
