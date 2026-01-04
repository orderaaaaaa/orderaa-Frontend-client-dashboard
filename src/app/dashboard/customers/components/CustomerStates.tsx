'use client';

import React, { useMemo } from 'react';
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
  const { data: allCustomersData } = useGetCustomers({
    page: 1,
    limit: 1,
  });

  const totalOrdersCount =
    allCustomersData?.meta?.totalItems?.toString() || '0';

  const transformedStatsData = useMemo(() => {
    return statsData.map((stat) => {
      if (stat.label === 'جميع العملاء') {
        return {
          ...stat,
          value: totalOrdersCount,
        };
      }
      return stat;
    });
  }, [totalOrdersCount]);

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
