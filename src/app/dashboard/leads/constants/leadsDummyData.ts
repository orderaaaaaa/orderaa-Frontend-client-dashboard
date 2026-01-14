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
    id: '1',
    name: 'خالد سمير',
    phone: '013456789012',
    email: 'khalid.smith@gmail.com',
    endDate: '7/1/2026',
    activityStatus: 'active',
    daysStatus: 'oneDayRemaining',
  },
  {
    id: '2',
    name: 'خالد سمير',
    phone: '013456789012',
    email: 'khalid.smith@gmail.com',
    endDate: '7/1/2026',
    activityStatus: 'noActivity',
    daysStatus: 'threeDaysRemaining',
  },
];

// Todays Followups Data
export interface FollowupLead {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export const TODAYS_FOLLOWUPS_DUMMY_DATA: FollowupLead[] = [
  {
    id: '1',
    name: 'خالد سمير',
    phone: '013456789012',
    email: 'khalid.ameh@gmail.com',
  },
  {
    id: '2',
    name: 'خالد سمير',
    phone: '013456789012',
    email: 'khalid.ameh@gmail.com',
  },
];

// Lead Search Filter Options
export const LEAD_TYPE_OPTIONS = [
  { key: 'all', value: 'جميع الأنواع' },
  { key: 'hot', value: 'ساخن' },
  { key: 'warm', value: 'دافئ' },
  { key: 'cold', value: 'بارد' },
  { key: 'active', value: 'نشط' },
  { key: 'lost', value: 'مفقود' },
  { key: 'paid', value: 'عميل مدفوع' },
];

export const LEAD_SOURCE_OPTIONS = [
  { key: 'all', value: 'جميع المصادر' },
  { key: 'website', value: 'الموقع الإلكتروني' },
  { key: 'social', value: 'وسائل التواصل الاجتماعي' },
  { key: 'referral', value: 'إحالة' },
  { key: 'advertisement', value: 'إعلان' },
  { key: 'direct', value: 'مباشر' },
  { key: 'other', value: 'أخرى' },
];

// Leads Table Data
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

export const LEADS_TABLE_HEADERS: ILeadTableHeader[] = [
  { id: '1', key: 'client', label: 'العميل' },
  { id: '2', key: 'contact', label: 'التواصل' },
  { id: '3', key: 'source', label: 'المصدر' },
  { id: '4', key: 'leadType', label: 'الشارة' },
  { id: '5', key: 'time', label: 'الوقت' },
  { id: '6', key: 'lastContact', label: 'اخر اتصال' }, // Changed from 'action'
  { id: '7', key: 'state', label: 'الحالة' },
];

export const LEADS_TABLE_DATA: ILeadTableRow[] = [
  {
    id: '1',
    name: 'خالد سمير',
    status: 'trialEnding',
    statusText: 'تم انشاء حساب',
    phone: '013456789012',
    email: 'khalid.smith@gmail.com',
    source: 'Linked In',
    leadType: 'hotLeads',
    time: 'يوم واحد متبقي',
    timeIcon: true,
    timeSince: 'منذ ساعتين',
    action: 'منذ ساعتين',
    actionType: 'trialEnding',
    state: 'التجربة قرب الانتهاء',
  },
  {
    id: '2',
    name: 'خالد سمير',
    status: 'paid',
    statusText: 'عميل مدفوع',
    phone: '013456789012',
    email: 'khalid.smith@gmail.com',
    source: 'Website',
    leadType: 'warmLeads',
    time: 'يوم واحد متبقي',
    timeIcon: true,
    timeSince: 'منذ ساعتين',
    action: 'منذ ساعتين',
    actionType: 'paid',
    state: 'تم دفع 400جنيه',
  },
  {
    id: '3',
    name: 'خالد سمير',
    status: 'trialEnded',
    statusText: 'انتهت التجربة',
    phone: '013456789012',
    email: 'khalid.smith@gmail.com',
    action: 'منذ ساعتين',
    source: 'Referll',
    leadType: 'coldLeads',
    time: 'يوم واحد متبقي',
    timeIcon: true,
    timeSince: 'منذ ساعتين',
    state: 'لم يدفع',
  },
  {
    id: '4',
    name: 'خالد سمير',
    status: 'new',
    statusText: 'جديد',
    phone: '013456789012',
    email: 'khalid.smith@gmail.com',
    source: 'Website',
    leadType: 'hotLeads',
    time: 'يوم واحد متبقي',
    timeIcon: true,
    timeSince: 'منذ ساعتين',
    action: 'منذ ساعتين',
    actionType: 'new',
    state: 'تجربة مجانية نشطة',
  },
];
