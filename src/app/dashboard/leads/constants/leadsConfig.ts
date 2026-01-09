import {
  PiUsersThree,
  PiClockCountdown,
  PiMagnifyingGlass,
} from 'react-icons/pi';
import { BsCash } from 'react-icons/bs';

import { FaRegSnowflake } from 'react-icons/fa';
import { LiaSunSolid } from 'react-icons/lia';
import { VscFlame } from 'react-icons/vsc';
import { LuCircleCheckBig } from 'react-icons/lu';

export interface LeadStatConfig {
  key: string;
  title: string;
  icon: React.ComponentType;
  iconBgColor: string;
  iconColor: string;
  valueColor: string;
}

export const LEADS_STATS_CONFIG: LeadStatConfig[] = [
  {
    key: 'totalLeads',
    title: 'Total Leads',
    icon: PiUsersThree,
    iconBgColor: '#f1eef6',
    iconColor: '#5d24e1',
    valueColor: '#5d24e1',
  },
  {
    key: 'hotLeads',
    title: 'Hot leads',
    icon: VscFlame,
    iconBgColor: '#fbedec',
    iconColor: '#F44336',
    valueColor: '#F44336',
  },
  {
    key: 'warmLeads',
    title: 'Warm leads',
    icon: LiaSunSolid,
    iconBgColor: '#fcf4e8',
    iconColor: '#ff9800',
    valueColor: '#ff9800',
  },
  {
    key: 'coldLeads',
    title: 'Cold leads',
    icon: FaRegSnowflake,
    iconBgColor: '#eef6fc',
    iconColor: '#49b1fe',
    valueColor: '#49b1fe',
  },
  {
    key: 'activeExperience',
    title: 'Active experience',
    icon: LuCircleCheckBig,
    iconBgColor: '#eef6fc',
    iconColor: '#49b1fe',
    valueColor: '#49b1fe',
  },
  {
    key: 'lost',
    title: 'Lost',
    icon: PiMagnifyingGlass,
    iconBgColor: '#fbedec',
    iconColor: '#F44336',
    valueColor: '#F44336',
  },
  {
    key: 'experimentEnded',
    title: 'Experiment ended',
    icon: PiClockCountdown,
    iconBgColor: '#fbf9e8',
    iconColor: '#f0d800',
    valueColor: '#f0d800',
  },
  {
    key: 'paidCustomers',
    title: 'Paid customers',
    icon: BsCash,
    iconBgColor: '#edf8e8',
    iconColor: '#3cc900',
    valueColor: '#3cc900',
  },
];
