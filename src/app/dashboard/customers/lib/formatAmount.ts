import { formatMoney } from '@/utils/formatMoney';

export const formatAmount = (value: number) => formatMoney(String(value));
