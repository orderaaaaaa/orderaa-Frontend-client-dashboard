export const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100 || 0;

export const moneyCents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) || 0;
