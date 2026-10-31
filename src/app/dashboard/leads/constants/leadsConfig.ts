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
    iconBgColor: 'bg-primary/10',
    iconColor: 'text-primary',
    valueColor: 'text-primary',
  },
  {
    key: 'hotLeads',
    title: 'Hot leads',
    icon: VscFlame,
    iconBgColor: 'bg-red-50',
    iconColor: 'text-[#F44336]',
    valueColor: 'text-[#F44336]',
  },
  {
    key: 'warmLeads',
    title: 'Warm leads',
    icon: LiaSunSolid,
    iconBgColor: 'bg-orange-50',
    iconColor: 'text-[#ff9800]',
    valueColor: 'text-[#ff9800]',
  },
  {
    key: 'coldLeads',
    title: 'Cold leads',
    icon: FaRegSnowflake,
    iconBgColor: 'bg-blue-50',
    iconColor: 'text-[#49b1fe]',
    valueColor: 'text-[#49b1fe]',
  },
  {
    key: 'activeExperience',
    title: 'Active experience',
    icon: LuCircleCheckBig,
    iconBgColor: 'bg-blue-50',
    iconColor: 'text-[#49b1fe]',
    valueColor: 'text-[#49b1fe]',
  },
  {
    key: 'lost',
    title: 'Lost',
    icon: PiMagnifyingGlass,
    iconBgColor: 'bg-red-50',
    iconColor: 'text-[#F44336]',
    valueColor: 'text-[#F44336]',
  },
  {
    key: 'experimentEnded',
    title: 'Experiment ended',
    icon: PiClockCountdown,
    iconBgColor: 'bg-yellow-50',
    iconColor: 'text-[#f0d800]',
    valueColor: 'text-[#f0d800]',
  },
  {
    key: 'paidCustomers',
    title: 'Paid customers',
    icon: BsCash,
    iconBgColor: 'bg-green-50',
    iconColor: 'text-[#3cc900]',
    valueColor: 'text-[#3cc900]',
  },
];
