// constants/leads/leadsDummyData.ts
// NOTE: This file contains dummy data for development only
// Will be removed during implementation when real API data is available

import { Lead } from '../types/leads';

export interface LeadsStatsData {
  coldLeads: number;
  warmLeads: number;
  hotLeads: number;
  totalLeads: number;
  paidCustomers: number;
  experimentEnded: number;
  lost: number;
  activeExperience: number;
}

export const LEADS_DUMMY_DATA: LeadsStatsData = {
  coldLeads: 1,
  warmLeads: 3,
  hotLeads: 2,
  totalLeads: 6,
  paidCustomers: 3,
  experimentEnded: 1,
  lost: 2,
  activeExperience: 4,
};

export const LEADS_LIST_DUMMY_DATA: Lead[] = [
  {
    id: 1,
    name: 'خالد سمير',
    email: 'khalid.smith@gmail.com',
    phone: '013456789012',
    status: 'oneDayRemaining',
    endDate: '7/1/2026',
    clientsCount: 5,
    info: '4 عميل باقي لهم 5 ايام او اقل - تابع معهم الان - مشاهدة المزيد',
  },
  {
    id: 2,
    name: 'خالد سمير',
    email: 'khalid.smith@gmail.com',
    phone: '013456789012',
    status: 'threeDaysRemaining',
    endDate: '7/1/2026',
    clientsCount: 3,
    info: '4 عميل باقي لهم 5 ايام او اقل - تابع معهم الان - مشاهدة المزيد',
  },
  {
    id: 3,
    name: 'خالد سمير',
    email: 'khalid.smith@gmail.com',
    phone: '013456789012',
    status: 'active',
    endDate: '7/1/2026',
    clientsCount: 8,
    info: '4 عميل باقي لهم 5 ايام او اقل - تابع معهم الان - مشاهدة المزيد',
  },
  {
    id: 4,
    name: 'خالد سمير',
    email: 'khalid.smith@gmail.com',
    phone: '013456789012',
    status: 'noActivity',
    endDate: '7/1/2026',
    clientsCount: 2,
    info: '4 عميل باقي لهم 5 ايام او اقل - تابع معهم الان - مشاهدة المزيد',
  },
];
