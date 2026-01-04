import React from 'react';
import { StatsTabProps } from '../../../types/CustomersDetailsModal';
import { buildStatCards } from '../../../constants/DetailsStates';

const StatsTab: React.FC<StatsTabProps> = (props) => {
  const statCards = buildStatCards(props);

  return (
    <div className="mb-8">
      <div className="mb-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
          <h1 className="text-lg font-bold text-gray-900">الأحصائيات</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="flex flex-col border border-gray-100 rounded-xl overflow-hidden shadow-sm"
          >
            <div className="bg-[#dbd1f5] p-3 text-center text-gray-900 font-medium">
              {card.title}
            </div>

            <div className="bg-white p-5 flex flex-col h-full">
              <div className="mb-4 text-center md:text-right">
                <p className="text-3xl font-bold text-gray-900">{card.rate}%</p>
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs md:text-sm border-t pt-3">
                <div className="flex gap-1">
                  <span className="text-gray-500">{card.label}:</span>
                  <span className="font-bold">{card.count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsTab;
