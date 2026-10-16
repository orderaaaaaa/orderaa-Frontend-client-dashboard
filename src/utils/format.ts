export const APP_LOCALE = 'ar-EG-u-nu-latn';

const EMPTY_VALUE = '—';
const DATE_TIME_SEPARATOR = '، ';

export type DateInput = string | number | Date | null | undefined;

export interface FractionDigitsOptions {
  minFractionDigits?: number;
  maxFractionDigits?: number;
}

const dateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  hour: 'numeric',
  minute: '2-digit',
});

const numberFormatters = new Map<string, Intl.NumberFormat>();

const getNumberFormatter = (options?: FractionDigitsOptions): Intl.NumberFormat => {
  const key = `${options?.minFractionDigits ?? ''}:${options?.maxFractionDigits ?? ''}`;
  const cached = numberFormatters.get(key);
  if (cached) return cached;
  const formatter = new Intl.NumberFormat(APP_LOCALE, {
    minimumFractionDigits: options?.minFractionDigits,
    maximumFractionDigits: options?.maxFractionDigits,
  });
  numberFormatters.set(key, formatter);
  return formatter;
};

const toValidDate = (value: DateInput): Date | null => {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatNumber = (value: number, options?: FractionDigitsOptions): string =>
  getNumberFormatter(options).format(value);

export const formatDate = (value: DateInput): string => {
  const date = toValidDate(value);
  return date ? dateFormatter.format(date) : EMPTY_VALUE;
};

export const formatTime = (value: DateInput): string => {
  const date = toValidDate(value);
  return date ? timeFormatter.format(date) : EMPTY_VALUE;
};

export const formatDateTime = (value: DateInput): string => {
  const date = toValidDate(value);
  return date
    ? `${dateFormatter.format(date)}${DATE_TIME_SEPARATOR}${timeFormatter.format(date)}`
    : EMPTY_VALUE;
};
