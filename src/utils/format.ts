export const APP_LOCALE = 'ar-EG-u-nu-latn';

const EMPTY_VALUE = '—';
const DATE_TIME_SEPARATOR = '، ';

export type DateInput = string | number | Date | null | undefined;

export interface FractionDigitsOptions {
  minFractionDigits?: number;
  maxFractionDigits?: number;
}

const CAIRO_TIME_ZONE = 'Africa/Cairo';

const dayMonthYearFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: CAIRO_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const weekdayFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: CAIRO_TIME_ZONE,
  weekday: 'long',
});

const timeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: CAIRO_TIME_ZONE,
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

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const formatNumber = (value: number | null | undefined, options?: FractionDigitsOptions): string =>
  isFiniteNumber(value) ? getNumberFormatter(options).format(value) : EMPTY_VALUE;

export const toStockNumber = (value: unknown): number => (isFiniteNumber(value) ? value : 0);

export const formatStockNumber = (value: unknown): string => formatNumber(toStockNumber(value));

const formatDayMonthYear = (date: Date): string => {
  const parts = dayMonthYearFormatter.formatToParts(date);
  const partOf = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '';
  return [partOf('day'), partOf('month'), partOf('year')].join('/');
};

export const formatDate = (value: DateInput): string => {
  const date = toValidDate(value);
  return date ? formatDayMonthYear(date) : EMPTY_VALUE;
};

export const formatWeekdayDate = (value: DateInput): string => {
  const date = toValidDate(value);
  return date ? `${weekdayFormatter.format(date)} ${formatDayMonthYear(date)}` : EMPTY_VALUE;
};

export const formatTime = (value: DateInput): string => {
  const date = toValidDate(value);
  return date ? timeFormatter.format(date) : EMPTY_VALUE;
};

export const formatDateTime = (value: DateInput): string => {
  const date = toValidDate(value);
  return date
    ? `${formatDayMonthYear(date)}${DATE_TIME_SEPARATOR}${timeFormatter.format(date)}`
    : EMPTY_VALUE;
};
