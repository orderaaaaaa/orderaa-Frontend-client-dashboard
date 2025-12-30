import React from 'react';

interface StatsTabProps {
  deliveryRate: number;
  cancellationRate: number;
  returnRate: number;
  delivered: number;
  cancelled: number;
  returned: number;
  totalOrders: number;
}

const StatsTab: React.FC<StatsTabProps> = ({
  deliveryRate,
  cancellationRate,
  returnRate,
  delivered,
  cancelled,
  returned,
  totalOrders,
}) => {
  const statCards = [
    {
      title: 'نسبة المرتجعات',
      rate: returnRate,
      label: 'طلبات مرتجعة',
      count: returned,
    },
    {
      title: 'نسبة الإلغاء',
      rate: cancellationRate,
      label: 'طلبات ملغية',
      count: cancelled,
    },
    {
      title: 'معدل التسليم',
      rate: deliveryRate,
      label: 'تم التسليم',
      count: delivered,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
  );
};

export default StatsTab;
