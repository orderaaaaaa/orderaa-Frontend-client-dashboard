'use client';

import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

import StatCard from './StateCard';
import { LEADS_STATS_CONFIG } from '../constants/leadsConfig';
import { LEADS_DUMMY_DATA } from '../constants/leadsDummyData';

interface LeadsStatsCardsProps {
  data?: typeof LEADS_DUMMY_DATA;
}

const LeadsStatsCards: React.FC<LeadsStatsCardsProps> = ({
  data = LEADS_DUMMY_DATA,
}) => {
  const statsData = useMemo(() => {
    return LEADS_STATS_CONFIG.map((config) => ({
      ...config,
      value: data[config.key as keyof typeof data],
    }));
  }, [data]);

  return (
    <div className="2xl:w-[90%] mt-14">
      {/* --- Mobile View: Swiper Cards Effect --- */}
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
          {statsData.map((stat) => (
            <SwiperSlide key={stat.key} className="pb-10">
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={<stat.icon />}
                iconBgColor={stat.iconBgColor}
                iconColor={stat.iconColor}
                valueColor={stat.valueColor}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- Desktop View: Original Grid --- */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10">
        {statsData.map((stat) => (
          <StatCard
            key={stat.key}
            title={stat.title}
            value={stat.value}
            icon={<stat.icon />}
            iconBgColor={stat.iconBgColor}
            iconColor={stat.iconColor}
            valueColor={stat.valueColor}
          />
        ))}
      </div>
    </div>
  );
};

export default LeadsStatsCards;
