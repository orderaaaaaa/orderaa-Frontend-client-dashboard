'use client';
import React from 'react';
import { egyptRegions } from '../constants/EgyptMapSectionConst';

export default function EgyptMapSection() {
  return (
    <div className="bg-white rounded-2xl  p-6 flex flex-col mt-10 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg text-right border-b-2 border-purple-600 pb-1 w-fit">
          خريطة مصر
        </h2>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regions List */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-right">
          {egyptRegions.map((r, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>{r.percent}%</span>
                <span>{r.value}</span>
                <span className="font-bold">{r.name}</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5D24E1] rounded-full"
                  style={{ width: `${r.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        {/* Map */}
        <div className="flex justify-center items-center">
          <img
            src="/Icons/eg.svg"
            width={200}
            height={200}
            alt="خريطة مصر"
            className="w-full max-w-xl !text-red-500" // Change color here
          />
        </div>
      </div>
    </div>
  );
}
