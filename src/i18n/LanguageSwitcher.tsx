'use client';

import { Button } from '@/components/ui/button';
import ToggleGroup from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useI18n } from './I18nProvider';
import { LOCALES, type Locale } from './locale';

/**
 * Endonyms, not translations: a language is named in its own language in every
 * locale, so these never go through the catalogue. Switching to a language you
 * cannot read is exactly when you need its name written the way you know it.
 */
const LOCALE_ENDONYMS: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};

const OPTIONS = LOCALES.map((locale) => ({
  value: locale,
  label: LOCALE_ENDONYMS[locale],
}));

interface Props {
  className?: string;
  /** one button naming the other language, for bars with no room for the pills */
  compact?: boolean;
}

export function LanguageSwitcher({ className, compact = false }: Props) {
  const { locale, setLocale, t } = useI18n();

  if (compact) {
    // Names the language you would switch TO, not the one you are in. The
    // mobile top bar already carries a menu, a search toggle, a refresh button
    // and the greeting; two pills push that row past a small phone and the
    // whole header starts scrolling sideways. With exactly two languages a
    // single button is unambiguous.
    const other: Locale = locale === 'ar' ? 'en' : 'ar';

    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setLocale(other)}
        aria-label={t('common.language')}
        className={cn('px-2 text-xs font-medium', className)}
      >
        {LOCALE_ENDONYMS[other]}
      </Button>
    );
  }

  return (
    <div role="group" aria-label={t('common.language')}>
      <ToggleGroup
        options={OPTIONS}
        value={locale}
        onChange={setLocale}
        className={className}
      />
    </div>
  );
}
