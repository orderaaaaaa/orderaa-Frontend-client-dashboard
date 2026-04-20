import { ShippingProvider } from '../types/shipping';
import rmExpressLogo from '@/assets/images/RM_EXPRESS.jpeg';

export const providers: ShippingProvider[] = [
  {
    id: 'turbo',
    name: 'Turbo',
    logo: '/Icons/turbo.png',
    description: 'ربط خدمات Turbo للشحن السريع',
    isActive: true,
  },
  {
    id: 'aramex',
    name: 'Aramex',
    logo: '/Icons/aramex.png',
    description: 'ربط خدمات أرامكس للشحن السريع وتلقي الحالات',
    isActive: false,
  },
  {
    id: 'bosta',
    name: 'Bosta',
    logo: '/Icons/bosta.png',
    description: 'بوسطة للشحن وتوصيل الطلبات للمنازل',
    isActive: true,
  },
  {
    id: 'shipblu',
    name: 'ShipBlu',
    logo: '/Icons/shipblu.png',
    description: 'شيب بلو للخدمات اللوجستية المتقدمة',
    isActive: false,
  },
  {
    id: 'mylerz',
    name: 'Mylerz',
    logo: '/Icons/mylerz-logo.png',
    description: 'مايلرز للتوصيل في نفس اليوم والحالات الفورية',
    isActive: false,
  },
  {
    id: 'jt_express',
    name: 'J&T Express',
    logo: '/Icons/j&t express.png',
    description: 'جي أند تي إكسبريس لخدمات الشحن العالمية',
    isActive: true,
  },
  {
    id: 'red',
    name: 'Red',
    logo: '/Icons/red-shipping-company.png',
    description: 'شركة ريد للشحن والتوصيل',
    isActive: true,
  },
  {
    id: 'hashtag',
    name: 'Hashtag',
    logo: '/Icons/hashtag-shipping-company.png',
    description: 'شركة هاشتاج للشحن والتوصيل',
    isActive: true,
  },
  {
    id: 'quick_connect',
    name: 'Quick Connect',
    logo: '/Icons/quick-connect-company.jpeg',
    description: 'شركة كويك كونكت للشحن والتوصيل',
    isActive: true,
  },
  {
    id: 'rm_express',
    name: 'RM Express',
    logo: rmExpressLogo.src,
    description: 'شركة ار ام اكسبريس للشحن والتوصيل',
    isActive: true,
  },
];
