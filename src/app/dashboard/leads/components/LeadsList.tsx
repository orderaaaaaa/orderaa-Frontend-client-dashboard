'use client';

import React from 'react';
import { HiOutlineMail } from 'react-icons/hi';
import { IoLogoWhatsapp } from 'react-icons/io';
import { BsClockHistory } from 'react-icons/bs';
import { Lead } from '../types/leads';
import { LEAD_STATUS_CONFIG } from '../constants/leadsListConfig';
import { LEADS_LIST_DUMMY_DATA } from '../constants/leadsDummyData';

interface LeadsListProps {
  leads?: Lead[];
}

const LeadsList: React.FC<LeadsListProps> = ({
  leads = LEADS_LIST_DUMMY_DATA,
}) => {
  return (
    <div className="mt-15">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-10">
        <div className="flex items-center gap-2">
          <BsClockHistory className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">
            التجربة المجانية قرب الانتهاء
          </h2>
        </div>
        <p className="text-right text-gray-600 text-xl">
          4 عميل باقي لهم 5 ايام او اقل - تابع معهم الان - مشاهدة المزيد
        </p>
      </div>

      {/* Leads Cards */}
      <div className="space-y-4">
        {leads.map((lead) => {
          const statusConfig = LEAD_STATUS_CONFIG[lead.status];

          return (
            <div
              key={lead.id}
              className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row justify-between gap-4 sm:gap-0"
            >
              {/* Right: Content */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Name and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {lead.name}
                  </h3>
                  <span
                    className={`mt-1 sm:mt-0 px-3 sm:px-4 py-1.5 rounded-lg w-fit font-semibold text-sm border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <IoLogoWhatsapp className="w-5 h-5" />
                    <span>{lead.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineMail className="w-5 h-5" />
                    <span>{lead.email}</span>
                  </div>
                </div>

                {/* End Date */}
                <div className="text-gray-600 text-sm">
                  تنتهي قريبا : {lead.endDate}
                </div>
              </div>

              {/* Left: Button */}
              <div className="flex-shrink-0">
                <button className="w-full sm:w-auto bg-primary text-white px-6 sm:px-10 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#5a3ec7] transition-colors">
                  متابعة العميل
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadsList;
