'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  applyDocumentLocale,
  DEFAULT_LOCALE,
  LOCALE_DIRECTION,
  readStoredLocale,
  writeStoredLocale,
  type Locale,
} from './locale';
import {
  translate,
  type TranslationKey,
  type TranslationParams,
} from './translate';

interface I18nContextValue {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  /**
   * ALWAYS the default on the first render, never the stored preference.
   *
   * `src/app/layout.tsx` is a server component: the HTML that reaches the
   * browser is `lang="ar" dir="rtl"` with Arabic text, and the client's first
   * tree has to match it exactly or React throws a hydration mismatch and
   * discards the server markup. Reading `localStorage` during render is the
   * classic way to cause that, so the read happens in an effect below.
   *
   * The cost is one frame of Arabic for an English user before the effect
   * commits. That is the right trade: the alternatives are
   * `suppressHydrationWarning` (which keeps the wrong DOM and only hides the
   * warning), or negotiating the locale server-side from a cookie, which means
   * a middleware and a non-static root layout for a preference that is Arabic
   * for nearly every user anyway.
   */
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored !== DEFAULT_LOCALE) setLocaleState(stored);
  }, []);

  // Text and direction flip in the same commit — a tree that has swapped to
  // English while `<html dir>` still says rtl is worse than either state.
  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    // Persisted only on an explicit choice, so a user who never touched the
    // switcher has nothing stored and Axios keeps sending the default.
    writeStoredLocale(next);
    setLocaleState(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: LOCALE_DIRECTION[locale],
      setLocale,
      t: (key, params) => translate(locale, key, params),
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  // No silent Arabic fallback: the provider sits in the root layout, so a null
  // here means the component escaped the tree and the bug should be loud.
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}
