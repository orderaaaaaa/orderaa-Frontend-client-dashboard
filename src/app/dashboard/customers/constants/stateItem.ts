export interface StatItem {
  iconSrc: string;
  label: string;
  value: string;
  subtitle?: string;
}

export const statsData: StatItem[] = [
  {
    iconSrc: '/Icons/orders.svg',
    label: 'جميع العملاء',
    value: '208',
  },
  {
    iconSrc: '/Icons/customers.svg',
    label: 'Loyal Buyer',
    value: '0',
  },
  {
    iconSrc: '/Icons/premium.svg',
    label: 'Loyal Buyer',
    value: '0',
  },
  {
    iconSrc: '/Icons/wholesale.svg',
    label: 'مشتري بالجملة',
    value: '0',
  },

  {
    iconSrc: '/Icons/ghost.svg',
    label: 'Ghost agent',
    value: '0',
  },
  {
    iconSrc: '/Icons/online-viewer.svg',
    label: 'Window shopper',
    value: '0',
  },

  {
    iconSrc: '/Icons/high-value.svg',
    label: 'High Value',
    value: '0',
  },
  {
    iconSrc: '/Icons/no-response.svg',
    label: 'No Response',
    value: '0',
  },
  {
    iconSrc: '/Icons/ShippingPaid.svg',
    label: 'Shipping Paid',
    value: '0',
  },
  {
    iconSrc: '/Icons/OppositeOpinion.svg',
    label: 'Opposite Opinion',
    value: '0',
  },
  {
    iconSrc: '/Icons/Cancel.svg',
    label: 'Cancel',
    value: '0',
  },
];
