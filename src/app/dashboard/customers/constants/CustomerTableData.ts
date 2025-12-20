export interface CustomerData {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  orderCount: number;
  lastOrderDate: string;
  status: string;
  activityType: string;
  activityIcon: string;
  totalSpent: string;
  flagged: boolean;
}

export const customersTableData: CustomerData[] = [
  {
    id: '1',
    name: 'احمد محمد على',
    code: '#CM001',
    phone: '01123456789',
    email: 'ahme@gmail.com',
    orderCount: 15,
    lastOrderDate: '12/11/2025',
    status: 'تم التوصيل',
    activityType: 'Loyal Buyer',
    activityIcon: '👑',
    totalSpent: '12,500 جنيه',
    flagged: true,
  },
  {
    id: '2',
    name: 'سارة احمد محمد',
    code: '#CM001',
    phone: '01123456789',
    email: 'ahme@gmail.com',
    orderCount: 15,
    lastOrderDate: '12/11/2025',
    status: 'تم التشديد',
    activityType: 'bulk buyer',
    activityIcon: '📋',
    totalSpent: '12,500 جنيه',
    flagged: false,
  },
  {
    id: '3',
    name: 'على محمود',
    code: '#CM001',
    phone: '01123456789',
    email: 'ahme@gmail.com',
    orderCount: 15,
    lastOrderDate: '12/11/2025',
    status: 'ملغي',
    activityType: 'Ghost agent',
    activityIcon: '👻',
    totalSpent: '12,500 جنيه',
    flagged: true,
  },
  {
    id: '4',
    name: 'عمر حسين',
    code: '#CM001',
    phone: '01123456789',
    email: 'ahme@gmail.com',
    orderCount: 15,
    lastOrderDate: '12/11/2025',
    status: 'مرتجع',
    activityType: 'Window shopper',
    activityIcon: '🛍️',
    totalSpent: '12,500 جنيه',
    flagged: true,
  },
  {
    id: '5',
    name: 'عمر حسين',
    code: '#CM001',
    phone: '01123456789',
    email: 'ahme@gmail.com',
    orderCount: 15,
    lastOrderDate: '12/11/2025',
    status: 'تم التوصيل',
    activityType: 'High Value',
    activityIcon: '💰',
    totalSpent: '12,500 جنيه',
    flagged: true,
  },
  {
    id: '6',
    name: 'عمر حسين',
    code: '#CM001',
    phone: '01123456789',
    email: 'ahme@gmail.com',
    orderCount: 15,
    lastOrderDate: '12/11/2025',
    status: 'مرتجع',
    activityType: 'No Show',
    activityIcon: '📞',
    totalSpent: '12,500 جنيه',
    flagged: true,
  },
];

export const statusColors: { [key: string]: string } = {
  'تم التوصيل': 'bg-green-100 text-green-700',
  'تم التشديد': 'bg-purple-100 text-purple-700',
  ملغي: 'bg-red-100 text-red-700',
  مرتجع: 'bg-yellow-100 text-yellow-700',
};

export const activityTypeColors: { [key: string]: string } = {
  'Loyal Buyer': 'bg-green-50 text-green-700',
  'bulk buyer': 'bg-purple-50 text-purple-700',
  'Ghost agent': 'bg-gray-100 text-gray-700',
  'Window shopper': 'bg-yellow-50 text-yellow-600',
  'High Value': 'bg-blue-50 text-blue-700',
  'No Show': 'bg-red-50 text-red-700',
};
