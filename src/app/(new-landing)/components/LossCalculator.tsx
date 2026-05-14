'use client';

import { useMemo, useState } from 'react';
import { LiaCoinsSolid, LiaCalendarSolid, LiaCalendarAltSolid } from 'react-icons/lia';
import { RevealOnScroll } from './primitives/RevealOnScroll';
import { copy } from '../content/copy';

function formatCurrency(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function LossCalculator() {
  const { ordersPerDay, failRate, profitPerOrder } = copy.loss.inputs;
  const [orders, setOrders] = useState<number>(ordersPerDay.default);
  const [rate, setRate] = useState<number>(failRate.default);
  const [profit, setProfit] = useState<number>(profitPerOrder.default);

  const daily = Math.round(orders * (rate / 100) * profit);
  const monthly = daily * 30;
  const yearly = daily * 365;

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        x: 5 + (i * 7) % 90,
        delay: (i * 0.4) % 6,
        size: 14 + (i % 4) * 4,
        dur: 6 + (i % 5),
      })),
    [],
  );

  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
        <div className="absolute -left-40 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-[#EF4444]/8 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-[#7B2CFF]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5">
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-lg uppercase tracking-[0.3em] text-[#9D4EDD]">
            {copy.loss.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-[var(--nl-text)] md:text-5xl">
            {copy.loss.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
            {copy.loss.sub}
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]">
          <RevealOnScroll
            className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-[#11162B] to-[#0A0E1E] p-6 md:p-8"
            delay={0.1}
          >
            <div className="space-y-7">
              <Slider
                label={ordersPerDay.label}
                min={ordersPerDay.min}
                max={ordersPerDay.max}
                step={ordersPerDay.step}
                value={orders}
                onChange={setOrders}
                accent="#7B2CFF"
              />
              <Slider
                label={failRate.label}
                min={failRate.min}
                max={failRate.max}
                step={failRate.step}
                value={rate}
                onChange={setRate}
                accent="#EF4444"
                suffix="%"
              />
              <Slider
                label={profitPerOrder.label}
                min={profitPerOrder.min}
                max={profitPerOrder.max}
                step={profitPerOrder.step}
                value={profit}
                onChange={setProfit}
                accent="#9D4EDD"
              />
            </div>
            <p className="mt-7 rounded-2xl border border-[#7B2CFF]/20 bg-[#7B2CFF]/[0.06] p-4 text-base leading-relaxed text-[var(--nl-text)]">
              {copy.loss.footnote}
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15} className="relative">
            <div className="relative h-full overflow-hidden rounded-3xl border border-[#EF4444]/20 bg-gradient-to-br from-[#1A0E15] via-[#0A0E1E] to-[#0A0E1E] p-6 md:p-8">
              {particles.map((p) => (
                <span
                  key={p.id}
                  aria-hidden
                  className="absolute select-none font-bold text-[#EF4444]/30 nl-anim-fall"
                  style={{
                    left: `${p.x}%`,
                    fontSize: p.size,
                    animationDuration: `${p.dur}s`,
                    animationDelay: `${p.delay}s`,
                  }}
                >
                  ج.م
                </span>
              ))}

              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base uppercase tracking-[0.25em] text-[#EF4444]/80">
                    الخسارة المتوقعة
                  </span>
                  <span className="rounded-full border border-[#EF4444]/30 bg-[#EF4444]/[0.08] px-3 py-0.5 text-base text-[#FF6B6B]">
                    خسارة بدون Orderaa
                  </span>
                </div>

                <LossLine
                  icon={<LiaCalendarSolid size={20} />}
                  label={copy.loss.daily}
                  value={daily}
                  size="md"
                />
                <LossLine
                  icon={<LiaCalendarAltSolid size={20} />}
                  label={copy.loss.monthly}
                  value={monthly}
                  size="xl"
                  emphasis
                />
                <LossLine
                  icon={<LiaCoinsSolid size={20} />}
                  label={copy.loss.yearly}
                  value={yearly}
                  size="md"
                />
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  accent,
  suffix,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  accent: string;
  suffix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-base text-[var(--nl-text-mute)]">{label}</span>
        <span
          className="rounded-full px-3 py-0.5 font-mono text-base font-semibold"
          style={{ background: accent + '18', color: accent }}
        >
          {value}
          {suffix ?? ''}
        </span>
      </div>
      <div className="relative py-3">
        <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-[width] duration-100"
            style={{ width: `${pct}%`, background: accent }}
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-[3px] bg-white shadow-[0_4px_18px_-2px_rgba(0,0,0,0.4)] transition-[right] duration-100"
          style={{ right: `calc(${pct}% - 10px)`, borderColor: accent }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
        />
      </div>
    </div>
  );
}

function LossLine({
  icon,
  label,
  value,
  size,
  emphasis,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  size: 'md' | 'xl';
  emphasis?: boolean;
}) {
  return (
    <div
      className={`mt-5 flex items-baseline justify-between border-b border-white/[0.06] pb-5 last:border-b-0 ${emphasis ? 'rounded-2xl border-x border-t border-[#EF4444]/20 bg-[#EF4444]/[0.04] px-4 py-5' : ''
        }`}
    >
      <div className="flex items-center gap-3 text-[var(--nl-text-mute)]">
        <span className={emphasis ? 'text-[#FF6B6B]' : 'text-[var(--nl-text-mute)]'}>
          {icon}
        </span>
        <span className={emphasis ? 'text-base font-medium text-[var(--nl-text)]' : 'text-base'}>
          {label}
        </span>
      </div>
      <div
        className={`flex items-baseline gap-1.5 font-mono font-bold tabular-nums ${size === 'xl'
          ? 'text-3xl text-[#FF6B6B] md:text-5xl'
          : 'text-xl text-[var(--nl-text)] md:text-2xl'
          }`}
      >
        <span>{formatCurrency(value)}</span>
        <span className="text-base font-normal text-[var(--nl-text-mute)] md:text-base">
          {copy.loss.currency}
        </span>
      </div>
    </div>
  );
}
