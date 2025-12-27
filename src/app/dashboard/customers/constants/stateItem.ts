export interface StatItem {
  iconSrc: string;
  label: string;
  value: string;
  subtitle?: string;
}

export const statsData: StatItem[] = [
  {
    iconSrc: '/Icons/orders.svg',
    label: 'إحصائي الطلبات',
    value: '208',
  },
  {
    iconSrc: '/Icons/customers.svg',
    label: 'Loyal Buyer',
    value: '15',
  },
  {
    iconSrc: '/Icons/premium.svg',
    label: 'Loyal Buyer',
    value: '15',
  },
  {
    iconSrc: '/Icons/wholesale.svg',
    label: 'مشتري بالجملة',
    value: '12',
  },

  {
    iconSrc: '/Icons/ghost.svg',
    label: 'Ghost agent',
    value: '8',
  },
  {
    iconSrc: '/Icons/online-viewer.svg',
    label: 'Window shopper',
    value: '15',
  },

  {
    iconSrc: '/Icons/high-value.svg',
    label: 'High Value',
    value: '208',
  },
  {
    iconSrc: '/Icons/no-response.svg',
    label: 'No Response',
    value: '15',
  },
  {
    iconSrc: '/Icons/ShippingPaid.svg',
    label: 'Shipping Paid',
    value: '15',
  },
  {
    iconSrc: '/Icons/OppositeOpinion.svg',
    label: 'Opposite Opinion',
    value: '15',
  },
  {
    iconSrc: '/Icons/Cancel.svg',
    label: 'Cancel',
    value: '15',
  },
];
