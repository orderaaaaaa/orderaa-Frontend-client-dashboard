export const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100 || 0;

export const moneyCents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) || 0;

export const hasAtMostTwoDecimals = (value: string) =>
  /^\d*(\.\d{0,2})?$/.test(value.trim());

export const MONEY_DECIMALS_MESSAGE =
  'المبلغ لا يمكن أن يحتوي على أكثر من رقمين بعد العلامة العشرية';
