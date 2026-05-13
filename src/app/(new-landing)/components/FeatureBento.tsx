'use client';

import { motion } from 'framer-motion';
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
              <motion.div
                key={t.title}
                initial={{ y: 14 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.05, margin: '0px 0px 300px 0px' }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.04, ease: [0.22, 1, 0.36, 1] }}
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
                    <p className="mt-2 text-sm leading-relaxed text-[var(--nl-text-mute)] md:text-[15px]">
                      {t.body}
                    </p>
                    {t.size === 'lg' && <BentoBigArt variant={t.icon} />}
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BentoBigArt({ variant }: { variant: string }) {
  if (variant === 'orders') return <CancellationsArt />;
  return <StatusArt />;
}

function StatusArt() {
  return (
    <div className="mt-auto pt-6">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex items-center justify-between text-[10px] text-[var(--nl-text-mute)]">
          <span>الحالات اللحظية</span>
          <span className="font-mono">LIVE</span>
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-1">
          {[
            { l: 'جديد', c: '#7B2CFF', v: 60 },
            { l: 'تم المحاوله اليوم', c: '#9D4EDD', v: 80 },
            { l: 'مؤكد', c: '#22C55E', v: 100 },
            { l: 'تأجيل', c: '#FEBC2E', v: 45 },
            { l: 'إلغاء', c: '#EF4444', v: 30 },
          ].map((b) => (
            <div key={b.l} className="flex flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end overflow-hidden rounded-md bg-white/[0.03]">
                <div
                  className="w-full"
                  style={{ height: `${b.v}%`, background: b.c, opacity: 0.85 }}
                />
              </div>
              <span className="text-[10px] text-[var(--nl-text-mute)]">{b.l}</span>
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
        <div className="flex items-center justify-between text-[10px] text-[var(--nl-text-mute)]">
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
              <span className="line-clamp-2 text-center text-[10px] leading-tight text-[var(--nl-text-mute)]">
                {b.l}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
