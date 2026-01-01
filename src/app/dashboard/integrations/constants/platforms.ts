import { IntegrationPlatform } from '../types/platformAndIntegrationCard';

export const platforms: IntegrationPlatform[] = [
  {
    id: 'easyorder',
    name: 'Easy Order',
    logo: '/integrations/easyorder.svg',
    description: 'ربط متجرك بمنصة Easy Order',
    buttonText: 'إنشاء ربط جديد',
    isActive: true,
  },
  {
    id: 'shopify',
    name: 'Shopify',
    logo: '/integrations/shopify.svg',
    description: 'ربط متجرك بمنصة Shopify',
    buttonText: 'إنشاء ربط جديد',
    isActive: false,
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    logo: '/integrations/wordpress.svg',
    description: 'ربط متجرك بمنصة WordPress',
    buttonText: 'إنشاء ربط جديد',
    isActive: false,
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    logo: '/integrations/woocommerce.svg',
    description: 'ربط متجرك بمنصة WooCommerce',
    buttonText: 'إنشاء ربط جديد',
    isActive: false,
  },
];
