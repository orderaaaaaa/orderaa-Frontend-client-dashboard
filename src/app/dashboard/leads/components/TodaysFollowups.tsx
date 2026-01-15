'use client';

import React from 'react';
import { BsClock } from 'react-icons/bs';
import { GoMail } from 'react-icons/go';
import { LiaWhatsapp } from 'react-icons/lia';
import {
  TODAYS_FOLLOWUPS_DUMMY_DATA,
  FollowupLead,
} from '../constants/leadsDummyData';

interface TodaysFollowupsProps {
  followups?: FollowupLead[];
}

const TodaysFollowups: React.FC<TodaysFollowupsProps> = ({
  followups = TODAYS_FOLLOWUPS_DUMMY_DATA,
}) => {
  return (
    <div className="mt-15">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col gap-2 mb-10 ">
          <div className="flex items-center gap-2">
            <BsClock className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">متابعات اليوم</h2>
          </div>
          <p className="text-right text-gray-600 text-xl">
            4 متابعة مطلوبة - ابدأ الآن
          </p>
        </div>
      </div>

      {/* Followup Cards */}
      <div className="space-y-4">
        {followups.map((followup) => {
          return (
            <div
              key={followup.id}
              className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 sm:py-8 flex flex-col sm:flex-row gap-4 sm:gap-0"
            >
              {/* Right: Content */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Name and Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {followup.name}
                  </h3>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-2 sm:mt-0">
                    <button className="px-4 py-1 rounded-sm font-semibold text-sm border border-[#3cc900] bg-[#f7fdf5] text-[#3cc900]">
                      واتساب
                    </button>
                    <button className="px-8 py-1 rounded-sm font-semibold text-sm border border-[#ff0004] bg-[#fff5f5] text-[#ff0004]">
                      متاخر
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-7 font-medium text-s">
                  <div className="flex items-center gap-1">
                    <LiaWhatsapp className="w-5 h-5 text-gray-500" />
                    <span>{followup.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GoMail className="w-4 h-4 text-gray-500" />
                    <span>{followup.email}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodaysFollowups;
