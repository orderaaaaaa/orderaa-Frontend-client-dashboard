export interface StoreStats {
  id: string;
  value: number;
  statsValue: string;
}

export const STORE_DUMMY_DATA: StoreStats[] = [
  {
    id: 'total-stores',
    value: 50,
    statsValue: '2.5%',
  },
  {
    id: 'total-sales',
    value: 127.23,
    statsValue: '2.5%',
  },
  {
    id: 'total-revenue',
    value: 1247000,
    statsValue: '2.5%',
  },
  {
    id: 'delivery-rate',
    value: 82,
    statsValue: '2.5%',
  },
  {
    id: 'customer-retention',
    value: 90,
    statsValue: '2.5%',
  },
];
