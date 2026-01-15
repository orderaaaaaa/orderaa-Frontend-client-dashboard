interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  valueColor: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  endDate: string;
  activityStatus: 'active' | 'noActivity';
  daysStatus?: 'oneDayRemaining' | 'threeDaysRemaining';
}

export interface ILeadTableRow {
  id: string;
  name: string;
  status?: string;
  statusText?: string;
  phone: string;
  email: string;
  source: string;
  leadType: string;
  time: string;
  timeIcon?: boolean;
  timeSince?: string;
  action?: string;
  actionType?: string;
  state?: string;
}

export interface ILeadTableHeader {
  id: string;
  key: string;
  label: string;
}
