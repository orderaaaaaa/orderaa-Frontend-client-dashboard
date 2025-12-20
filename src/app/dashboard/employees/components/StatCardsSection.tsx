'use client';

import React, { useMemo, useCallback, memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination as SwiperPagination } from 'swiper/modules';
import { StatCard } from './StatCard';
import { STAT_CARDS } from '../constants/statCard';
import 'swiper/css';
import 'swiper/css/pagination';

interface StatCardsSectionProps {
  totalItems: number;
}

export const StatCardsSection = memo(
  function StatCardsSection({ totalItems }: StatCardsSectionProps) {
    const getCountByAccessLevel = useCallback(
      (accessLevel: string) => {
        if (accessLevel === 'TOTAL') {
          return totalItems;
        }
        return 0;
      },
      [totalItems]
    );

    const mobileStatCards = useMemo(
      () =>
        STAT_CARDS.map((card) => (
          <SwiperSlide key={card.title}>
            <StatCard
              title={card.title}
              count={getCountByAccessLevel(card.accessLevel)}
              borderColor={card.borderColor}
              iconBgColor={card.iconBgColor}
              iconPath={card.iconPath}
              alt={card.alt}
            />
          </SwiperSlide>
        )),
      [getCountByAccessLevel]
    );

    const desktopStatCards = useMemo(
      () =>
        STAT_CARDS.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            count={getCountByAccessLevel(card.accessLevel)}
            borderColor={card.borderColor}
            iconBgColor={card.iconBgColor}
            iconPath={card.iconPath}
            alt={card.alt}
          />
        )),
      [getCountByAccessLevel]
    );

    return (
      <>
        {/* Mobile Stat Cards */}
        <div className="block sm:hidden mt-6">
          <Swiper
            modules={[SwiperPagination]}
            spaceBetween={16}
            slidesPerView={1}
            pagination={{ clickable: true }}
            className="stat-cards-swiper"
          >
            {mobileStatCards}
          </Swiper>
        </div>

        {/* Desktop Stat Cards */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
          {desktopStatCards}
        </div>
      </>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.totalItems === nextProps.totalItems;
  }
);

StatCardsSection.displayName = 'StatCardsSection';
