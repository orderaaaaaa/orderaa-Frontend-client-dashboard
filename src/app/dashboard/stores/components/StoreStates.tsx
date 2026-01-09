import React from 'react';
import StoresStateCard from './StoresStateCard';
import { STORE_CARDS } from '../constants/store_constants';
import { STORE_DUMMY_DATA } from '../constants/store_dummy_data';

function StoreStates() {
  return (
    <section className="grid grid-cols-4 gap-4">
      {STORE_CARDS.map((card) => {
        const data = STORE_DUMMY_DATA.find((d) => d.id === card.id);

        return (
          <StoresStateCard
            key={card.id}
            title={card.title}
            value={data?.value || 0}
            statsValue={data?.statsValue || '0%'}
            Icon={card.icon}
          />
        );
      })}
    </section>
  );
}

export default StoreStates;
