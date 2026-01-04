import { Transaction } from '../types/transaction';

export const TRANSACTIONS_LOG: Transaction[] = [
  {
    id: '1',
    date: '10 /26 /2025',
    planName: 'خطة 5 دولار',
    paymentMethod: 'بطاقة الائتمان',
    amountUSD: '$ 10.00',
    amountEGP: '(500.00 EGP)',
  },
  {
    id: '2',
    date: '11/15/2025',
    planName: 'خطة 15 دولار',
    paymentMethod: 'PayPal',
    amountUSD: '$ 15.00',
    amountEGP: '(750.00 EGP)',
  },
  {
    id: '3',
    date: '12/30/2025',
    planName: 'خطة 20 دولار',
    paymentMethod: 'Debit Card',
    amountUSD: '$ 20.00',
    amountEGP: '(1000.00 EGP)',
  },
  {
    id: '4',
    date: '01/10/2026',
    planName: 'خطة 25 دولار',
    paymentMethod: 'Bank Transfer',
    amountUSD: '$ 25.00',
    amountEGP: '(1250.00 EGP)',
  },
];
