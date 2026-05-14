'use client';

import {
  LiaArrowLeftSolid,
  LiaPlaySolid,
  LiaTruckMovingSolid,
  LiaStoreSolid,
  LiaWarehouseSolid,
  LiaCheckCircleSolid,
} from 'react-icons/lia';
import { AuroraBackground } from './AuroraBackground';
import { MagneticButton } from './primitives/MagneticButton';
import { CountUp } from './primitives/CountUp';
import { RevealItem } from './primitives/RevealItem';
import { copy } from '../content/copy';

const pillIcons = [LiaTruckMovingSolid, LiaStoreSolid, LiaWarehouseSolid];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pb-20 pt-32 md:pb-32 md:pt-40"
    >
      <AuroraBackground variant="hero" />

      <div className="relative z-10 mx-auto max-w-7xl px-5">
        <div className="mx-auto max-w-4xl text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-base text-[var(--nl-text-mute)] backdrop-blur-md nl-anim-fade-in-up"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7B2CFF] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7B2CFF]" />
            </span>
            {copy.hero.eyebrow}
          </div>

          <h1 className="mt-7 text-4xl font-bold leading-[1.15] tracking-tight text-[var(--nl-text)] md:text-6xl lg:text-7xl">
            <span
              className="inline-block nl-anim-fade-in-up"
              style={{ animationDelay: '0.05s' }}
            >
              {copy.hero.headlinePre}
            </span>{' '}
            <span
              className="inline-block nl-anim-fade-in-up"
              style={{ animationDelay: '0.18s' }}
            >
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-[#9D4EDD] via-[#7B2CFF] to-[#5d24e1] bg-clip-text text-transparent">
                  {copy.hero.headlineHighlight}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-l from-[#9D4EDD] via-[#7B2CFF] to-[#5d24e1] nl-anim-scale-x-in"
                  style={{ animationDelay: '0.6s' }}
                />
              </span>
            </span>{' '}
            <span
              className="inline-block nl-anim-fade-in-up"
              style={{ animationDelay: '0.32s' }}
            >
              {copy.hero.headlinePost}
            </span>
          </h1>

          <p
            className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg nl-anim-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            {copy.hero.sub}
          </p>

          <div
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row nl-anim-fade-in-up"
            style={{ animationDelay: '0.65s' }}
          >
            <MagneticButton variant="primary">
              {copy.hero.ctaPrimary}
              <LiaArrowLeftSolid />
            </MagneticButton>
            <MagneticButton variant="outline" strength={8}>
              <LiaPlaySolid />
              {copy.hero.ctaSecondary}
            </MagneticButton>
          </div>

          <div
            className="mt-12 grid grid-cols-3 gap-3 sm:gap-6 nl-anim-fade-in"
            style={{ animationDelay: '0.85s' }}
          >
            {copy.hero.stats.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 backdrop-blur-sm"
              >
                <div className="font-mono text-2xl font-bold text-[var(--nl-text)] sm:text-3xl">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-base text-[var(--nl-text-mute)] sm:text-base">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative mx-auto mt-16 max-w-5xl nl-anim-fade-in-up"
          style={{ animationDelay: '0.7s', animationDuration: '1s' }}
        >
          <DashboardMock />
        </div>

        <RevealItem className="mt-32 grid grid-cols-1 gap-3 md:grid-cols-3">
          {copy.hero.pills.map((p, i) => {
            const Icon = pillIcons[i];
            return (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-sm transition-colors hover:border-[#7B2CFF]/40"
              >
                <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-[#7B2CFF]/20 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-30" />
                <div className="relative flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#7B2CFF] to-[#3A0CA3] text-white shadow-[0_4px_20px_-2px_rgba(123,44,255,0.6)]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--nl-text)]">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-base leading-relaxed text-[var(--nl-text-mute)]">
                      {p.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </RevealItem>
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <div className="relative">
      <div className="absolute inset-x-10 -bottom-8 h-10 rounded-full bg-[#7B2CFF]/40 blur-3xl" />
      <div className="absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-[#7B2CFF]/30 via-transparent to-[#3A0CA3]/30 blur-xl" />
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-b from-[#11162B] to-[#0A0E1E] p-1 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="mx-auto rounded-md bg-white/[0.04] px-3 py-0.5 text-base text-[var(--nl-text-mute)]">
            أورديرا · لوحة التحكم
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-[200px_1fr]">
          <div className="hidden md:block">
            <div className="space-y-1">
              {[
                'لوحة التحكم',
                'الأوردرات',
                'الكول سنتر',
                'التغليف',
                'الشحن',
                'المخزون',
                'المرتجعات',
                'التقارير',
              ].map((l, i) => (
                <div
                  key={l}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-base ${
                    i === 1
                      ? 'bg-[#7B2CFF]/15 text-[var(--nl-text)]'
                      : 'text-[var(--nl-text-mute)]'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                  {l}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'أوردرات اليوم', value: '1,284', accent: '#7B2CFF' },
                { label: 'تم التسليم', value: '892', accent: '#22C55E' },
                { label: 'قيد الشحن', value: '247', accent: '#3A0CA3' },
                { label: 'فشل تسليم', value: '32', accent: '#EF4444' },
              ].map((k) => (
                <div
                  key={k.label}
                  className="rounded-xl border border-white/5 bg-white/[0.025] p-3"
                >
                  <div className="text-base text-[var(--nl-text-mute)]">{k.label}</div>
                  <div className="mt-0.5 font-mono text-lg font-bold text-[var(--nl-text)]">
                    {k.value}
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${40 + (k.value.length * 9) % 50}%`,
                        background: k.accent,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-base text-[var(--nl-text)]">أداء شركات الشحن (آخر 30 يوم)</span>
                <span className="text-base text-[var(--nl-text-mute)]">آخر 30 يوم</span>
              </div>
              <svg viewBox="0 0 320 90" className="h-20 w-full">
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7B2CFF" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#7B2CFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,70 C30,60 50,40 80,45 C110,50 130,20 160,25 C190,30 210,55 240,40 C270,28 290,20 320,15 L320,90 L0,90 Z"
                  fill="url(#g1)"
                />
                <path
                  d="M0,70 C30,60 50,40 80,45 C110,50 130,20 160,25 C190,30 210,55 240,40 C270,28 290,20 320,15"
                  stroke="#9D4EDD"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="mb-2 text-base text-[var(--nl-text)]">آخر الأوردرات</div>
              <div className="space-y-1.5">
                {[
                  { id: '#طلب-2841', name: 'محمد علي', city: 'القاهرة', state: 'تم الشحن', color: '#7B2CFF' },
                  { id: '#طلب-2840', name: 'سارة محمود', city: 'الإسكندرية', state: 'مؤكد', color: '#22C55E' },
                  { id: '#طلب-2839', name: 'أحمد سيد', city: 'الجيزة', state: 'قيد المراجعة', color: '#FEBC2E' },
                ].map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-base"
                  >
                    <div className="flex items-center gap-2 text-[var(--nl-text-mute)]">
                      <LiaCheckCircleSolid style={{ color: r.color }} />
                      <span className="font-mono">{r.id}</span>
                      <span>•</span>
                      <span>{r.name}</span>
                      <span className="opacity-60">— {r.city}</span>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-base"
                      style={{ background: r.color + '22', color: r.color }}
                    >
                      {r.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
