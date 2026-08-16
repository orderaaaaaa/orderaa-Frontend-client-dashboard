'use client';

import { LiaTruckSolid } from 'react-icons/lia';
import { useShippingConfig } from '../hooks/useShippingConfig';
import useShippingCompanies from '@/hooks/useShippingCompanies';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { GovernorateConfigTable } from './GovernorateConfigTable';
import PageLoading from '@/components/ui/page-loading';

export function LogisticsSettingsSection() {
  const { shippingConfigs, isLoading: isLoadingConfigs } = useShippingConfig();
  const { shippingCompanies, isLoading: isLoadingCompanies } =
    useShippingCompanies();

  const isLoading = isLoadingConfigs || isLoadingCompanies;

  // Driven by the company lookup, which now returns one entry per company.
  // It used to map over raw shipping configs and de-duplicate them here — that
  // band-aid is gone (T23), and this list cannot repeat a carrier by
  // construction. OTHERS is dropped because the follow-up delay query excludes
  // it outright, so configuring it could never have an effect.
  const configuredCompanies = new Set(
    (shippingConfigs ?? []).filter((c) => c.isActive).map((c) => c.shippingCompany)
  );
  const activeCompanies = shippingCompanies.filter(
    (company) => company.key !== 'OTHERS' && configuredCompanies.has(company.key)
  );

  if (isLoading) {
    return <PageLoading size="sm" className="py-6 min-h-0" />;
  }

  if (activeCompanies.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <LiaTruckSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
              إعدادات اللوجستيك والمحافظات
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              قم بربط شركة شحن أولاً لإعداد المحافظات والمدد الزمنية
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LiaTruckSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            إعدادات اللوجستيك والمحافظات
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            حدد مدة أول محاولة وتكلفة الشحن لكل محافظة لكل شركة شحن
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {activeCompanies.map((company) => (
          <AccordionItem
            key={company.key}
            value={company.key}
            className="border border-gray-200 rounded-lg mb-3 last:mb-0 overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <LiaTruckSolid className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-900">
                  {company.label}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-2">
              <GovernorateConfigTable shippingCompany={company.key} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
