export interface StatItem {
  iconSrc: string;
  label: string;
  value: string;
  subtitle?: string;
}

export const statsData: StatItem[] = [
  {
    iconSrc: '/icons/customers.svg',
    label: 'Loyal Buyer',
    value: '15',
  },
  {
    iconSrc: '/icons/orders.svg',
    label: 'إحصائي الطلبات',
    value: '208',
    subtitle: 'طلب لكل عميل 13.9',
  },
  {
    iconSrc: '/icons/premium.svg',
    label: 'Loyal Buyer',
    value: '15',
  },
  {
    iconSrc: '/icons/wholesale.svg',
    label: 'مشتري بالجملة',
    value: '12',
  },

  {
    iconSrc: '/icons/ghost.svg',
    label: 'Ghost agent',
    value: '8',
  },
  {
    iconSrc: '/icons/online-viewer.svg',
    label: 'Window shopper',
    value: '15',
  },

  {
    iconSrc: '/icons/high-value.svg',
    label: 'High Value',
    value: '208',
  },
  {
    iconSrc: '/icons/no-response.svg',
    label: 'No Response',
    value: '15',
  },
  {
    iconSrc: '/icons/ShippingPaid.svg',
    label: 'Shipping Paid',
    value: '15',
  },
  {
    iconSrc: '/icons/OppositeOpinion.svg',
    label: 'Opposite Opinion',
    value: '15',
  },
  {
    iconSrc: '/icons/Cancel.svg',
    label: 'Cancel',
    value: '15',
  },
];
