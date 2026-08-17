import { DEFAULT_LOCALE, type Locale } from './locale';
import ar from './messages/ar';
import en from './messages/en';

export type TranslationKey = keyof typeof ar;

export type TranslationParams = Record<string, string | number>;

const MESSAGES: Record<Locale, Record<TranslationKey, string>> = { ar, en };

/**
 * Pure lookup, usable outside React — the Axios error interceptor needs it and
 * has no hooks available.
 *
 * Missing entries fall back to Arabic, mirroring the backend's
 * `fallbackLanguage: 'ar'`, so a half-translated screen degrades to the
 * reference language instead of rendering a raw key. `||` rather than `??`:
 * a blank translation is a missing one, not a deliberate empty string.
 * `en`'s `Record<keyof typeof ar, string>` type already makes an absent key
 * unbuildable; this is the runtime belt to that brace.
 */
export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: TranslationParams
): string {
  const template = MESSAGES[locale][key] || MESSAGES[DEFAULT_LOCALE][key];
  if (!params) return template;

  // One pass over the template, not a replace per parameter: a value that
  // itself contains `{...}` — a product name, a status label — must not be
  // re-scanned and substituted again. An unknown placeholder is left verbatim
  // so the gap is visible in the UI rather than silently collapsing.
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name];
    return value === undefined ? placeholder : String(value);
  });
}
