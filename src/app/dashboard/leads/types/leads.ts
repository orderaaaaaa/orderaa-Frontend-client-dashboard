interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  valueColor: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'oneDayRemaining' | 'threeDaysRemaining' | 'noActivity';
  endDate: string;
  clientsCount: number;
  info: string;
}
