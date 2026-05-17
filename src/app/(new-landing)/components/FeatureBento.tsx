'use client';

import {
  LiaListAltSolid,
  LiaHeadsetSolid,
  LiaTruckSolid,
  LiaBoxSolid,
  LiaWarehouseSolid,
  LiaUndoAltSolid,
  LiaUserFriendsSolid,
  LiaChartPieSolid,
  LiaStoreAltSolid,
  LiaLockSolid,
  LiaFileInvoiceSolid,
  LiaMobileAltSolid,
} from 'react-icons/lia';
import { GlowCard } from './primitives/GlowCard';
import { RevealOnScroll } from './primitives/RevealOnScroll';
import { RevealItem } from './primitives/RevealItem';
import { copy } from '../content/copy';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  orders: LiaListAltSolid,
  callcenter: LiaHeadsetSolid,
  shipping: LiaTruckSolid,
  package: LiaBoxSolid,
  stock: LiaWarehouseSolid,
  returns: LiaUndoAltSolid,
  customers: LiaUserFriendsSolid,
  analytics: LiaChartPieSolid,
  multistore: LiaStoreAltSolid,
  permissions: LiaLockSolid,
  suppliers: LiaFileInvoiceSolid,
  mobile: LiaMobileAltSolid,
};

const sizeClasses: Record<string, string> = {
  sm: 'md:col-span-1 md:row-span-1',
  md: 'md:col-span-2 md:row-span-1',
  lg: 'md:col-span-2 md:row-span-2',
};

export function FeatureBento() {
  return (
    <section id="features" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5">
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-lg uppercase tracking-[0.3em] text-[#9D4EDD]">
            {copy.features.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-[var(--nl-text)] md:text-5xl">
            {copy.features.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
            {copy.features.sub}
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-4">
          {copy.features.tiles.map((t, i) => {
            const Icon = iconMap[t.icon];
            return (
              <RevealItem
                key={t.title}
                delay={(i % 4) * 0.04}
                className={sizeClasses[t.size]}
              >
                <GlowCard className="h-full">
                  <div className="flex h-full flex-col p-6 md:p-7">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#7B2CFF]/25 to-[#3A0CA3]/15 text-[#C8A6FF] ring-1 ring-[#7B2CFF]/30">
                      <Icon size={24} />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-[var(--nl-text)] md:text-xl">
                      {t.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-[var(--nl-text-mute)] md:text-base">
                      {t.body}
                    </p>
                    {t.size === 'lg' && <BentoBigArt variant={t.icon} />}
                  </div>
                </GlowCard>
              </RevealItem>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BentoBigArt({ variant }: { variant: string }) {
  if (variant === 'orders') return <CancellationsArt />;
  if (variant === 'analytics') return <ShippingPerformanceArt />;
  return null;
}

function ShippingPerformanceArt() {
  const companies = [
    { name: 'بوسطة', region: 'القاهرة', rate: 78, c: '#22C55E' },
    { name: 'أرامكس', region: 'الجيزة', rate: 71, c: '#22C55E' },
    { name: 'J&T', region: 'الإسكندرية', rate: 64, c: '#FEBC2E' },
    { name: 'ريد', region: 'المنصورة', rate: 52, c: '#FEBC2E' },
    { name: 'هاشتاج', region: 'طنطا', rate: 38, c: '#EF4444' },
  ];

  return (
    <div className="mt-auto pt-6">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
        <div className="flex items-center justify-between text-base text-[var(--nl-text-mute)]">
          <span>أداء شركات الشحن بالمحافظة</span>
          <span className="font-mono">نسبة التسليم</span>
        </div>

        <div className="mt-3 space-y-2.5">
          {companies.map((c) => (
            <div key={c.name} className="flex items-center gap-2.5">
              <div className="flex w-24 shrink-0 items-baseline justify-between gap-1">
                <span className="text-base font-medium text-[var(--nl-text)]">
                  {c.name}
                </span>
                <span className="text-[9px] text-[var(--nl-text-mute)]">
                  {c.region}
                </span>
              </div>
              <div
                className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.04]"
                dir="ltr"
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${c.rate}%`,
                    background: `linear-gradient(90deg, ${c.c}, ${c.c}cc)`,
                    boxShadow: `0 0 10px -2px ${c.c}80`,
                  }}
                />
              </div>
              <span
                className="w-10 shrink-0 text-left font-mono text-base tabular-nums"
                style={{ color: c.c }}
              >
                {c.rate}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CancellationsArt() {
  const reasons = [
    { l: 'العميل غيّر رأيه', c: '#EF4444', v: 100 },
    { l: 'مش راضي عن السعر', c: '#F97316', v: 63 },
    { l: 'العنوان غلط', c: '#FEBC2E', v: 42 },
    { l: 'العميل مش بيرد', c: '#9D4EDD', v: 34 },
    { l: 'خارج نطاق التغطية', c: '#7B2CFF', v: 24 },
  ];

  return (
    <div className="mt-auto pt-6">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex items-center justify-between text-base text-[var(--nl-text-mute)]">
          <span>تحليل أسباب الإلغاء</span>
          <span className="font-mono">آخر 30 يوم</span>
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-1">
          {reasons.map((b) => (
            <div key={b.l} className="flex flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end overflow-hidden rounded-md bg-white/[0.03]">
                <div
                  className="w-full"
                  style={{ height: `${b.v}%`, background: b.c, opacity: 0.85 }}
                />
              </div>
              <span className="line-clamp-2 text-center text-base leading-tight text-[var(--nl-text-mute)]">
                {b.l}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
