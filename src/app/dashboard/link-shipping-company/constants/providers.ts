import { ShippingProvider } from '../types/shipping';

export const providers: ShippingProvider[] = [
  {
    id: 'aramex',
    name: 'Aramex',
    logo: '/Icons/aramex.png',
    description: 'ربط خدمات أرامكس للشحن السريع وتلقي الحالات',
    isActive: true,
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
    isActive: true,
  },
  {
    id: 'mylerz',
    name: 'Mylerz',
    logo: '/Icons/mylerz-logo.png',
    description: 'مايلرز للتوصيل في نفس اليوم والحالات الفورية',
    isActive: true,
  },
  {
    id: 'jt_express',
    name: 'J&T Express',
    logo: '/Icons/j&t express.png',
    description: 'جي أند تي إكسبريس لخدمات الشحن العالمية',
    isActive: true,
  },
];
