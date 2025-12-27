'use client';

import React from 'react';
// 1. Import Swiper components and modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';

// 2. Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';

import { StatsCard } from './StateCardCustomer';
import { statsData } from '../constants/stateItem';
import { useGetCustomers } from '../hooks/useGetCustomers'; // Adjust path as needed

interface CustomerStatesProps {
  searchTerm?: string;
  clientStatus?: string;
  orderStatus?: string;
}

export default function CustomerStates({
  searchTerm,
  clientStatus,
  orderStatus,
}: CustomerStatesProps) {
  // Get total count of ALL customers (no filters, just for counting)
  const { data: allCustomersData } = useGetCustomers({
    page: 1,
    limit: 1, // We only need meta.totalItems, minimal data fetch
    // No search or filter parameters to get total count
  });

  // Extract the total items count from the API response
  const totalOrdersCount =
    allCustomersData?.meta?.totalItems?.toString() || '0';

  // Transform stats data - replace only "إحصائي الطلبات" value with real count
  const transformedStatsData = statsData.map((stat) => {
    if (stat.label === 'إحصائي الطلبات') {
      return {
        ...stat,
        value: totalOrdersCount,
      };
    }
    return stat;
  });

  return (
    <div className="w-full mb-10" dir="rtl">
      {/* --- Mobile View: Swiper with Cards Effect --- */}
      <div className="block sm:hidden mt-6">
        <Swiper
          effect={'cards'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          cardsEffect={{
            slideShadows: false,
            rotate: true,
            perSlideOffset: 8,
          }}
          modules={[EffectCards]}
          className="w-full max-w-[280px] mx-auto"
        >
          {transformedStatsData.map((stat, index) => (
            <SwiperSlide key={index} className="pb-10">
              <StatsCard
                iconSrc={stat.iconSrc}
                label={stat.label}
                value={stat.value}
                subtitle={stat.subtitle}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- Desktop View: Original Grid --- */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 p-6 w-[93%] mx-auto">
        {transformedStatsData.map((stat, index) => (
          <StatsCard
            key={index}
            iconSrc={stat.iconSrc}
            label={stat.label}
            value={stat.value}
            subtitle={stat.subtitle}
          />
        ))}
      </div>
    </div>
  );
}
