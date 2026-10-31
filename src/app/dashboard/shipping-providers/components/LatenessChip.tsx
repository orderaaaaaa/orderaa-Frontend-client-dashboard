import type { TranslationKey, TranslationParams } from '@/i18n/translate';
import { cn } from '@/lib/utils';
import type { LatenessInfo } from '@/types/shippingProviders';

export type LatenessTone = 'late' | 'dueToday' | 'onTime' | 'none';

export interface LatenessChipModel {
  tone: LatenessTone;
  text: string;
  borderClassName: string;
  dotClassName: string;
  textClassName: string;
  daysLateText?: string;
}

type Translate = (key: TranslationKey, params?: TranslationParams) => string;

const TONE_STYLES: Record<LatenessTone, Omit<LatenessChipModel, 'tone' | 'text'>> = {
  late: {
    borderClassName: 'border-destructive',
    dotClassName: 'bg-destructive',
    textClassName: 'text-destructive',
  },
  dueToday: {
    borderClassName: 'border-warning',
    dotClassName: 'bg-warning',
    textClassName: 'text-foreground',
  },
  onTime: {
    borderClassName: 'border-success',
    dotClassName: 'bg-success',
    textClassName: 'text-foreground',
  },
  none: {
    borderClassName: 'border-transparent',
    dotClassName: 'bg-muted-foreground/40',
    textClassName: 'text-muted-foreground',
  },
};

export function lateDaysTextOf(days: number, t: Translate): string {
  if (days === 1) return t('inProcess.lateness.late.one');
  if (days === 2) return t('inProcess.lateness.late.two');
  const last = days % 100;
  if (last >= 3 && last <= 10) return t('inProcess.lateness.late.few', { n: days });
  return t('inProcess.lateness.late.many', { n: days });
}

export function latenessChipOf(lateness: LatenessInfo | null, t: Translate): LatenessChipModel {
  const flag = lateness?.flag ?? null;
  const daysLate = lateness?.daysLate ?? 0;
  const daysLateText = flag !== null && flag !== 'RED' && daysLate > 0 ? lateDaysTextOf(daysLate, t) : undefined;

  if (flag === 'RED') {
    const text = daysLate > 0 ? lateDaysTextOf(daysLate, t) : t('inProcess.lateness.late');
    return { tone: 'late', text, ...TONE_STYLES.late };
  }
  if (flag === 'YELLOW') {
    return { tone: 'dueToday', text: t('inProcess.lateness.dueToday'), daysLateText, ...TONE_STYLES.dueToday };
  }
  if (flag === 'GREEN') {
    return { tone: 'onTime', text: t('inProcess.lateness.onTime'), daysLateText, ...TONE_STYLES.onTime };
  }
  return { tone: 'none', text: t('inProcess.lateness.none'), ...TONE_STYLES.none };
}

export function LatenessChip({ model }: { model: LatenessChipModel }) {
  return (
    <span className="flex w-fit flex-col items-start gap-0.5">
      <span
        title={model.text}
        className={cn('inline-flex w-fit items-center gap-1.5 text-xs font-medium', model.textClassName)}
      >
        <span role="img" aria-label={model.text} className={cn('size-2.5 shrink-0 rounded-full', model.dotClassName)} />
        <span className="whitespace-nowrap">{model.text}</span>
      </span>
      {model.daysLateText && (
        <span className="whitespace-nowrap text-sm text-destructive">{model.daysLateText}</span>
      )}
    </span>
  );
}
