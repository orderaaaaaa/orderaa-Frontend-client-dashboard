export const getActivityColor = (activity: string) => {
  const colors: Record<string, string> = {
    'Loyal Buyer': 'bg-green-50 text-green-600 border border-green-200',
    'bulk buyer': 'bg-purple-50 text-purple-600 border border-purple-200',
    'Window shopper': 'bg-purple-50 text-purple-600 border border-purple-200',
    'No Show': 'bg-red-50 text-red-600 border border-red-200',
  };
  return colors[activity] || 'bg-gray-50 text-gray-600 border border-gray-200';
};
