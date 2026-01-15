'use client';

import React from 'react';
import { BsClockHistory } from 'react-icons/bs';
import { Lead } from '../types/leads';
import {
  ACTIVITY_STATUS_CONFIG,
  DAYS_STATUS_CONFIG,
} from '../constants/leadsListConfig';
import { LEADS_LIST_DUMMY_DATA } from '../constants/leadsDummyData';
import { GoMail } from 'react-icons/go';
import { LiaWhatsapp } from 'react-icons/lia';

interface LeadsListProps {
  leads?: Lead[];
}

const LeadsList: React.FC<LeadsListProps> = ({
  leads = LEADS_LIST_DUMMY_DATA,
}) => {
  return (
    <div className="mt-15">
      {/* Header */}
      <div className="flex px-1 max-md:flex-col md:items-center justify-between mb-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <BsClockHistory className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">
              التجربة المجانية قرب الانتهاء
            </h2>
          </div>
          <p className="text-right text-gray-600 text-xl max-md:mb-3">
            4 عميل باقي لهم 5 ايام او اقل - تابع معهم الان - مشاهدة المزيد
          </p>
        </div>
      </div>

      {/* Leads Cards */}
      <div className="space-y-4">
        {leads.map((lead) => {
          const activityConfig = ACTIVITY_STATUS_CONFIG[lead.activityStatus];
          const daysConfig = lead.daysStatus
            ? DAYS_STATUS_CONFIG[lead.daysStatus]
            : null;

          return (
            <div
              key={lead.id}
              className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row gap-4 sm:gap-0"
            >
              {/* Right: Content */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Name and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {lead.name}
                  </h3>

                  {/* Days Remaining Status - Conditionally shown */}
                  {daysConfig && (
                    <span
                      className={`mt-1 sm:mt-0 px-3 sm:px-4 py-1 rounded-lg w-fit font-semibold text-sm border ${daysConfig.bgColor} ${daysConfig.textColor} ${daysConfig.borderColor}`}
                    >
                      {daysConfig.label}
                    </span>
                  )}

                  {/* Activity Status - Always shown */}
                  <span
                    className={`mt-1 sm:mt-0 px-3 sm:px-4 py-1 rounded-lg w-fit font-semibold text-sm border ${activityConfig.bgColor} ${activityConfig.textColor} ${activityConfig.borderColor}`}
                  >
                    {activityConfig.label}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-7 font-medium text-s">
                  <div className="flex items-center gap-1">
                    <LiaWhatsapp className="w-5 h-5 text-gray-500" />
                    <span>{lead.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GoMail className="w-4 h-4 text-gray-500" />
                    <span>{lead.email}</span>
                  </div>
                </div>

                {/* End Date */}
                <div className="font-medium text-sm">
                  تنتهي قريبا : {lead.endDate}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadsList;
