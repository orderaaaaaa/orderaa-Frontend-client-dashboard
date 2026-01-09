'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

import StoresStateCard from './StoresStateCard';
import { STORE_CARDS } from '../constants/store_constants';
import { STORE_DUMMY_DATA } from '../constants/store_dummy_data';

function StoreStates() {
  // Transform data to merge STORE_CARDS with STORE_DUMMY_DATA
  const transformedCards = STORE_CARDS.map((card) => {
    const data = STORE_DUMMY_DATA.find((d) => d.id === card.id);
    return {
      ...card,
      value: data?.value || 0,
      statsValue: data?.statsValue || '0%',
    };
  });

  return (
    <section className="mt-6">
      {/* --- Mobile View: Swiper Cards Effect --- */}
      <div className="block sm:hidden">
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
          {transformedCards.map((card) => (
            <SwiperSlide key={card.id} className="pb-10">
              <StoresStateCard
                title={card.title}
                value={card.value}
                statsValue={card.statsValue}
                Icon={card.icon}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- Desktop View: Grid --- */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {transformedCards.map((card) => (
          <StoresStateCard
            key={card.id}
            title={card.title}
            value={card.value}
            statsValue={card.statsValue}
            Icon={card.icon}
          />
        ))}
      </div>
    </section>
  );
}

export default StoreStates;
