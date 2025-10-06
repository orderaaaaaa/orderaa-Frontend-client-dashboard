import React from 'react';
import Content from './Content';

export default function RightSide() {
  return (
    <div className="flex flex-col gap-2 px-4">
      <div className="flex items-center gap-2">
        <Content icon="id" content="الكود:" />
        <span className="text-[18px]">123456</span>
      </div>
      <Content icon="user" content="محمد عماد كمال" />
      <Content icon="phone" content="0123456789" />
      <Content icon="phone" content="0123456789" />
      <Content icon="phone" content="0123456789" />
      <Content icon="location" content="القاهرة - مصر" />
      <Content icon="package" content="42 نايك اسود " />
      <Content icon="package" content="42 نايك اسود " />
    </div>
  );
}
