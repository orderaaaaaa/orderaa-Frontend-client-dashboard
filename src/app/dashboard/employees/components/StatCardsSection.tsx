'use client';

import React, { useMemo, useCallback, memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';

import { StatCard } from './StatCard';
import { STAT_CARDS } from '../constants/statCard';
import { useEmployeesSummary } from '../hooks/useEmployees';

import 'swiper/css';
import 'swiper/css/effect-cards';

interface StatCardsSectionProps {
  totalItems: number;
}

export const StatCardsSection = memo(
  function StatCardsSection({ totalItems }: StatCardsSectionProps) {
    const { data: summary } = useEmployeesSummary();

    const countsByRole = useMemo(() => {
      const map = new Map<string, number>();
      summary?.byRole.forEach((item) => map.set(item.role, item.count));
      map.set('TOTAL', summary?.totalEmployees ?? totalItems);
      return map;
    }, [summary, totalItems]);

    const getCountByAccessLevel = useCallback(
      (accessLevel: string) => {
        return countsByRole.get(accessLevel) ?? 0;
      },
      [countsByRole]
    );

    const mobileStatCards = useMemo(
      () =>
        STAT_CARDS.map((card) => (
          <SwiperSlide key={card.title} className="!w-[260px]">
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
        {/* Mobile – Swiper Cards Effect */}
        <div className="block sm:hidden mt-6">
          <Swiper
            effect="cards"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            cardsEffect={{
              slideShadows: false,
              rotate: true,
              perSlideOffset: 8,
            }}
            modules={[EffectCards]}
            className="w-full max-w-xs mx-auto"
          >
            {mobileStatCards}
          </Swiper>
        </div>

        {/* Desktop – Grid */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
          {desktopStatCards}
        </div>
      </>
    );
  },
  (prev, next) => prev.totalItems === next.totalItems
);

StatCardsSection.displayName = 'StatCardsSection';
