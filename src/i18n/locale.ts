/**
 * The locale primitives, deliberately free of React and of the catalogues.
 *
 * The Axios instance imports `readStoredLocale` to stamp `Accept-Language` on
 * every request, and Axios is constructed at module load, long before any
 * provider mounts. Anything importing React here would drag the client runtime
 * into that graph, so this file stays plain.
 */

export const LOCALES = ['ar', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Arabic is the product default and the server-rendered language. */
export const DEFAULT_LOCALE: Locale = 'ar';

/**
 * A bare string, not a Zustand `persist` envelope like `auth-storage`: the Axios
 * interceptor reads this synchronously outside React on every request, and a
 * JSON parse per request to recover one two-letter value buys nothing.
 */
export const LOCALE_STORAGE_KEY = 'app-locale';

export const LOCALE_DIRECTION: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

const isLocale = (value: string | null): value is Locale =>
  value !== null && (LOCALES as readonly string[]).includes(value);

/**
 * Never throws and never returns undefined: callers are render paths and an
 * Axios interceptor, neither of which has anywhere useful to put a failure.
 * Storage that was hand-edited, or written by an older build, degrades to
 * Arabic rather than sending a junk `Accept-Language` the backend must reject.
 */
export function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    // Private-mode Safari throws on localStorage access.
    return DEFAULT_LOCALE;
  }
}

export function writeStoredLocale(locale: Locale) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {}
}

/**
 * The root layout is a server component and always ships `lang="ar" dir="rtl"`,
 * so the direction flip has to happen imperatively on the client. Setting both
 * attributes together keeps the document from ever describing itself as English
 * while still laid out right-to-left.
 */
export function applyDocumentLocale(locale: Locale) {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = locale;
  document.documentElement.dir = LOCALE_DIRECTION[locale];
}
