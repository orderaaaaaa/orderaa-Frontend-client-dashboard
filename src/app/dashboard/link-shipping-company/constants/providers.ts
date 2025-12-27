import { ShippingProvider } from '../types/shipping';

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
    isActive: false,
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
    isActive: false,
  },
];
