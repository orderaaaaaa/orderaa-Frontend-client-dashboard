'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type KpiAccent = 'primary' | 'chart1' | 'chart2' | 'chart3' | 'chart4' | 'chart5';
export type KpiChipTone = 'neutral' | 'success' | 'warning';

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  accent?: KpiAccent;
  chip?: { tone: KpiChipTone; text: string };
  trend?: {
    direction: 'up' | 'down' | 'flat';
    percent: number;
    tone: KpiChipTone;
    tooltip: string;
    ariaLabel: string;
  };
  dimmed?: boolean;
  className?: string;
}

export interface KpiSectionProps {
  title: string;
  columns: 3 | 4;
  children: ReactNode;
}

const ACCENT_CLASSES: Record<KpiAccent, string> = {
  primary: 'bg-primary/10 text-primary-text',
  chart1: 'bg-chart-1/15 text-chart-1',
  chart2: 'bg-chart-2/15 text-chart-2',
  chart3: 'bg-chart-3/15 text-chart-3',
  chart4: 'bg-chart-4/15 text-chart-4',
  chart5: 'bg-chart-5/15 text-chart-5',
};

const CHIP_TONE_CLASSES: Record<KpiChipTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-success/15 text-foreground',
  warning: 'bg-warning/15 text-foreground',
};

const CHIP_DOT_CLASSES: Record<'success' | 'warning', string> = {
  success: 'bg-success',
  warning: 'bg-warning',
};

const TREND_ARROW_TEXT_CLASSES: Record<KpiChipTone, string> = {
  neutral: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
};

const TREND_ARROW_GLYPH: Record<'up' | 'down' | 'flat', string> = {
  up: '▲',
  down: '▼',
  flat: '',
};

const SECTION_GRID_CLASSES: Record<3 | 4, string> = {
  3: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4',
  4: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4',
};

function KpiChip({ tone, text }: { tone: KpiChipTone; text: string }) {
  return (
    <span
      role={tone === 'warning' ? 'status' : undefined}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        CHIP_TONE_CLASSES[tone],
      )}
    >
      {tone !== 'neutral' && (
        <span aria-hidden="true" className={cn('size-1.5 rounded-full', CHIP_DOT_CLASSES[tone])} />
      )}
      {text}
    </span>
  );
}

function KpiTrend({
  direction,
  percent,
  tone,
  tooltip,
  ariaLabel,
}: NonNullable<KpiCardProps['trend']>) {
  const glyph = TREND_ARROW_GLYPH[direction];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          aria-label={ariaLabel}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
            CHIP_TONE_CLASSES[tone],
          )}
        >
          {glyph && (
            <span aria-hidden="true" className={TREND_ARROW_TEXT_CLASSES[tone]}>
              {glyph}
            </span>
          )}
          {`${percent}٪`}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  icon,
  accent = 'primary',
  chip,
  trend,
  dimmed,
  className,
}: KpiCardProps) {
  const labelId = React.useId();
  return (
    <section
      aria-labelledby={labelId}
      className={cn(
        'bg-card text-card-foreground border border-border rounded-xl p-5 shadow-sm',
        dimmed && 'opacity-60',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span id={labelId} className="text-sm text-muted-foreground">
            {label}
          </span>
          {trend && <KpiTrend {...trend} />}
        </div>
        <span
          aria-hidden="true"
          className={cn('size-10 rounded-lg flex items-center justify-center', ACCENT_CLASSES[accent])}
        >
          {icon}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">{value}</div>
      {hint && <div className="text-sm text-muted-foreground">{hint}</div>}
      {chip && <KpiChip tone={chip.tone} text={chip.text} />}
    </section>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      <div className="mt-3 h-8 w-32 bg-muted animate-pulse rounded" />
      <div className="mt-2 h-3 w-20 bg-muted animate-pulse rounded" />
    </div>
  );
}

export function KpiSection({ title, columns, children }: KpiSectionProps) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className={cn('mt-3', SECTION_GRID_CLASSES[columns])}>{children}</div>
    </section>
  );
}
