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

  const activeConfigs = (shippingConfigs ?? [])
    .filter((c) => c.isActive)
    .filter((c, i, arr) => arr.findIndex((x) => x.shippingCompany === c.shippingCompany) === i);

  const getCompanyLabel = (companyKey: string) => {
    const company = shippingCompanies.find((c) => c.key === companyKey);
    return company?.label ?? companyKey;
  };

  if (isLoading) {
    return <PageLoading size="sm" className="py-6 min-h-0" />;
  }

  if (activeConfigs.length === 0) {
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
        {activeConfigs.map((config) => (
          <AccordionItem
            key={config.id}
            value={config.shippingCompany}
            className="border border-gray-200 rounded-lg mb-3 last:mb-0 overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <LiaTruckSolid className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-900">
                  {getCompanyLabel(config.shippingCompany)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-2">
              <GovernorateConfigTable shippingCompanyId={config.id} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
