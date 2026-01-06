import React from 'react';
import { LuWallet, LuRefreshCcw } from 'react-icons/lu';

export interface WalletPricingPlan {
  title: string;
  price: string;
  subtitle: string;
  icon: React.ReactNode;
  features: string[];
  button: string;
  highlight?: boolean;
  gradient?: boolean;
}

export const WALLET_PRICING_PLANS: WalletPricingPlan[] = [
  {
    title: 'شحن 5 دولار',
    price: '5 دولار',
    subtitle: '(250 جنية)',
    icon: <LuWallet className="w-7 h-7 text-[#6135c9]" />,
    features: ['شحن محفظة بقيمة 5 دولار', 'يخصم 0.50 من كل طلب'],
    button: 'اشحن الآن',
    highlight: true, // Used for the purple border/button in the image
  },
  {
    title: 'شحن 10 دولار',
    price: '10 دولار',
    subtitle: '(500 جنية)',
    icon: <LuWallet className="w-7 h-7 text-[#6135c9]" />,
    features: ['شحن محفظة بقيمة 5 دولار', 'يخصم 0.50 من كل طلب'],
    button: 'اشحن الآن',
  },
  {
    title: 'شحن 20 دولار',
    price: '20 دولار',
    subtitle: '(1000 جنية)',
    icon: <LuWallet className="w-7 h-7 text-[#6135c9]" />,
    features: ['شحن محفظة بقيمة 5 دولار', 'يخصم 0.50 من كل طلب'],
    button: 'اشحن الآن',
  },
  {
    title: 'اشتراك شهري ثابت',
    price: '30 دولار',
    subtitle: '(1500 جنية)',
    icon: <LuRefreshCcw className="w-7 h-7 text-white" />,
    features: ['شحن محفظة بقيمة 5 دولار', 'يخصم 0.50 من كل طلب'],
    button: 'اشحن الآن',
    gradient: true, // Used for the solid purple background
  },
];
