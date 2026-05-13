'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  LiaStoreAltSolid,
  LiaPhoneVolumeSolid,
  LiaCheckCircleSolid,
  LiaBoxSolid,
  LiaTruckSolid,
  LiaMapMarkedAltSolid,
  LiaFileInvoiceDollarSolid,
  LiaWarehouseSolid,
  LiaSyncAltSolid,
  LiaBarcodeSolid,
  LiaUserCircleSolid,
  LiaPlaySolid,
  LiaArrowLeftSolid,
  LiaDownloadSolid,
} from 'react-icons/lia';
import { RevealOnScroll } from './primitives/RevealOnScroll';
import { copy } from '../content/copy';

const AUTOPLAY_MS = 4500;
const RESUME_AFTER_USER_SCROLL_MS = 8000;

export function OperationFlow() {
  const [active, setActive] = useState(0);
  const [sectionInView, setSectionInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const stepsRef = useRef<Array<HTMLLIElement | null>>([]);
  const pausedUntilRef = useRef(0);
  const autoScrollingRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => Number((e.target as HTMLElement).dataset.idx));
        if (visible.length === 0) return;
        setActive(Math.min(...visible));
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    );
    stepsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([entry]) => setSectionInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (autoScrollingRef.current) return;
      pausedUntilRef.current = Date.now() + RESUME_AFTER_USER_SCROLL_MS;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onScroll);
      window.removeEventListener('touchmove', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!sectionInView) return;
    const tick = window.setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setActive((prev) => {
        const next = (prev + 1) % copy.flow.steps.length;
        const target = stepsRef.current[next];
        if (target) {
          autoScrollingRef.current = true;
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          window.setTimeout(() => {
            autoScrollingRef.current = false;
          }, 1200);
        }
        return next;
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(tick);
  }, [sectionInView]);

  return (
    <section
      id="how"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#0A0E1E] to-[#040711] py-28 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-5">
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-lg uppercase tracking-[0.3em] text-[#9D4EDD]">
            {copy.flow.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-[var(--nl-text)] md:text-5xl">
            {copy.flow.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
            {copy.flow.sub}
          </p>
        </RevealOnScroll>

        <ol className="mt-16 space-y-10 lg:space-y-20">
          {copy.flow.steps.map((s, i) => {
            const isActive = active === i;
            return (
              <motion.li
                key={s.num}
                ref={(el) => {
                  stepsRef.current[i] = el;
                }}
                data-idx={i}
                initial={{ y: 18 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.05, margin: '0px 0px 300px 0px' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12"
              >
                <div
                  className={clsx(
                    'relative flex gap-4 rounded-3xl border p-5 backdrop-blur-sm transition-all duration-500 md:p-6',
                    isActive
                      ? 'border-[#7B2CFF]/40 bg-gradient-to-br from-[#1B0F3D]/60 to-white/[0.02] shadow-[0_0_40px_-10px_rgba(123,44,255,0.4)]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-[#7B2CFF]/25',
                  )}
                >
                  <div
                    className={clsx(
                      'shrink-0 self-start font-mono text-base font-bold leading-none transition-colors md:text-lg',
                      isActive ? 'text-[#C8A6FF]' : 'text-[var(--nl-text-mute)]/40',
                    )}
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#7B2CFF]/30 bg-[#0A0E1E] md:h-14 md:w-14">
                      {s.num}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={clsx(
                          'text-lg font-bold transition-colors md:text-xl',
                          isActive ? 'text-[var(--nl-text)]' : 'text-[var(--nl-text)]/85',
                        )}
                      >
                        {s.title}
                      </h3>
                      {isActive && (
                        <span className="hidden items-center gap-1 rounded-full bg-[#7B2CFF]/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#C8A6FF] lg:inline-flex">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8A6FF] opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C8A6FF]" />
                          </span>
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[15px] leading-relaxed text-[var(--nl-text-mute)] md:text-base">
                      {s.body}
                    </p>

                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {s.highlights.map((h) => (
                        <li
                          key={h}
                          className={clsx(
                            'rounded-full border px-2.5 py-1 text-[11px] transition-colors md:text-xs',
                            isActive
                              ? 'border-[#7B2CFF]/30 bg-[#7B2CFF]/[0.08] text-[var(--nl-text)]'
                              : 'border-white/[0.06] bg-white/[0.02] text-[var(--nl-text-mute)]',
                          )}
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <InlineScene idx={i} title={s.title} isActive={isActive} />
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function InlineScene({
  idx,
  title,
  isActive,
}: {
  idx: number;
  title: string;
  isActive: boolean;
}) {
  return (
    <div className="relative">
      <div
        className={clsx(
          'pointer-events-none absolute -inset-2 rounded-[28px] bg-gradient-to-br from-[#7B2CFF]/30 via-transparent to-[#3A0CA3]/30 blur-xl transition-opacity duration-500',
          isActive ? 'opacity-80' : 'opacity-30',
        )}
      />
      <div
        className={clsx(
          'relative overflow-hidden rounded-[24px] border bg-gradient-to-b from-[#11162B] to-[#0A0E1E] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] transition-all duration-500',
          isActive ? 'border-[#7B2CFF]/30' : 'border-white/10',
        )}
      >
        <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="mx-auto truncate rounded-md bg-white/[0.04] px-3 py-0.5 text-[11px] text-[var(--nl-text-mute)]">
            orderaa.com / {title}
          </span>
          <span className="font-mono text-[10px] text-[var(--nl-text-mute)]/60">
            {String(idx + 1).padStart(2, '0')} / 08
          </span>
        </div>
        <div className="p-5">
          <Scene idx={idx} />
        </div>
      </div>
    </div>
  );
}

function Scene({ idx }: { idx: number }) {
  switch (idx) {
    case 0:
      return <SceneConnect />;
    case 1:
      return <SceneCall />;
    case 2:
      return <SceneConfirm />;
    case 3:
      return <ScenePackage />;
    case 4:
      return <SceneShipping />;
    case 5:
      return <SceneTracking />;
    case 6:
      return <SceneInvoice />;
    case 7:
      return <SceneTransfer />;
    default:
      return null;
  }
}

function SceneHeader({ Icon, label }: { Icon: React.ComponentType<{ size?: number }>; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[var(--nl-text-mute)]">
      <Icon size={16} />
      <span className="font-mono text-[10px] uppercase tracking-[0.25em]">{label}</span>
    </div>
  );
}

function SceneConnect() {
  const stores = [
    { name: 'Shopify', orders: 1284, color: '#95BF47' },
    { name: 'Easy Orders', orders: 567, color: '#7B2CFF' },
  ];
  return (
    <div className="space-y-4">
      <SceneHeader Icon={LiaStoreAltSolid} label="Integrations" />
      <div className="grid grid-cols-2 gap-3">
        {stores.map((s) => (
          <div key={s.name} className="rounded-xl border border-white/5 bg-white/[0.025] p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--nl-text)]">{s.name}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[10px] text-[#22C55E]">
                <LiaCheckCircleSolid size={12} /> متصل
              </span>
            </div>
            <div className="mt-3 font-mono text-2xl font-bold text-[var(--nl-text)]">
              {s.orders.toLocaleString('en-US')}
            </div>
            <div className="text-[11px] text-[var(--nl-text-mute)]">طلب هذا الشهر</div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <div className="h-full rounded-full" style={{ width: '72%', background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#7B2CFF]/20 bg-[#7B2CFF]/[0.06] p-3.5">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-[#C8A6FF]"
          >
            <LiaSyncAltSolid size={16} />
          </motion.span>
          <span className="text-sm text-[var(--nl-text)]">جاري المزامنة — 234 طلب جديد</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-[#9D4EDD] to-[#7B2CFF]"
            initial={{ width: '20%' }}
            animate={{ width: ['20%', '85%', '20%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm text-[var(--nl-text-mute)] transition-colors hover:border-[#7B2CFF]/40 hover:text-[var(--nl-text)]">
        + ربط متجر جديد
      </button>
    </div>
  );
}

function SceneCall() {
  return (
    <div className="space-y-4">
      <SceneHeader Icon={LiaPhoneVolumeSolid} label="Live Call · #ORD-1284" />

      <div className="rounded-2xl border border-[#22C55E]/20 bg-[#22C55E]/[0.04] p-5 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#22C55E]/30 to-[#22C55E]/5 text-[#22C55E]">
          <LiaUserCircleSolid size={36} />
        </div>
        <div className="mt-3 text-base font-semibold text-[var(--nl-text)]">محمد علي</div>
        <div className="font-mono text-xs text-[var(--nl-text-mute)]">+20 100 234 5678</div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 text-xs">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-[#EF4444]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-[var(--nl-text)]">REC</span>
          <span className="font-mono text-[var(--nl-text-mute)]">00:42</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button className="cursor-pointer rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/[0.08] px-3 py-2.5 text-xs font-semibold text-[#22C55E] hover:bg-[#22C55E]/[0.14]">
          ✓ تأكيد
        </button>
        <button className="cursor-pointer rounded-xl border border-[#FEBC2E]/30 bg-[#FEBC2E]/[0.08] px-3 py-2.5 text-xs font-semibold text-[#FEBC2E] hover:bg-[#FEBC2E]/[0.14]">
          ⏸ تأجيل
        </button>
        <button className="cursor-pointer rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/[0.08] px-3 py-2.5 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/[0.14]">
          ✗ إلغاء
        </button>
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--nl-text-mute)]">
          ملاحظة
        </div>
        <div className="mt-1 text-xs leading-relaxed text-[var(--nl-text)]">
          العميل يريد التسليم يوم الأحد بعد الظهر — تم التأكيد على الكاش 845 جنيه.
        </div>
      </div>
    </div>
  );
}

function SceneConfirm() {
  return (
    <div className="space-y-4">
      <SceneHeader Icon={LiaCheckCircleSolid} label="Confirm · #ORD-1284" />

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-[var(--nl-text-mute)]">العميل</span>
          <span className="text-sm font-semibold text-[var(--nl-text)]">محمد علي</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-white/5 pt-2">
          <span className="text-sm text-[var(--nl-text-mute)]">الإجمالي</span>
          <span className="font-mono text-lg font-bold text-[var(--nl-text)]">
            845 <span className="text-[10px] font-normal text-[var(--nl-text-mute)]">جنيه</span>
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <SelectRow label="شركة الشحن" value="Bosta" />
        <SelectRow label="المحافظة" value="القاهرة" />
        <SelectRow label="المنطقة" value="مدينة نصر" />
      </div>

      <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#7B2CFF] to-[#3A0CA3] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(123,44,255,0.6)] hover:shadow-[0_12px_32px_-8px_rgba(123,44,255,0.8)]">
        تأكيد الطلب
        <LiaArrowLeftSolid />
      </button>
    </div>
  );
}

function SelectRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
      <span className="text-xs text-[var(--nl-text-mute)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--nl-text)]">{value}</span>
        <span className="text-[var(--nl-text-mute)]/60">▾</span>
      </div>
    </div>
  );
}

function ScenePackage() {
  return (
    <div className="space-y-4">
      <SceneHeader Icon={LiaBoxSolid} label="Batch Packing · 52 orders" />

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm text-[var(--nl-text)]">التقدم</span>
          <span className="font-mono text-2xl font-bold text-[var(--nl-text)]">
            39<span className="text-sm text-[var(--nl-text-mute)]"> / 52</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-[#22C55E] via-[#7B2CFF] to-[#3A0CA3]"
            initial={{ width: '0%' }}
            animate={{ width: '76%' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-1 text-[11px] text-[var(--nl-text-mute)]">76% — متبقي 13 طلب</div>
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'aspect-square rounded',
              i < 24
                ? 'bg-[#22C55E]/40 ring-1 ring-[#22C55E]/30'
                : i < 28
                  ? 'bg-[#7B2CFF]/30 ring-1 ring-[#7B2CFF]/40'
                  : 'bg-white/[0.04] ring-1 ring-white/5',
            )}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-[#7B2CFF]/25 bg-[#7B2CFF]/[0.05] p-3">
        <motion.div
          className="grid h-9 w-9 place-items-center rounded-lg bg-[#7B2CFF]/15 text-[#C8A6FF]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <LiaBarcodeSolid size={20} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-[var(--nl-text-mute)]">جاري المسح</div>
          <div className="truncate font-mono text-sm font-semibold text-[var(--nl-text)]">
            #ORD-2941
          </div>
        </div>
        <span className="text-[11px] text-[var(--nl-text-mute)]">بواسطة أحمد سيد</span>
      </div>
    </div>
  );
}

function SceneShipping() {
  return (
    <div className="space-y-4">
      <SceneHeader Icon={LiaTruckSolid} label="Shipping · Waybill" />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-[#7B2CFF]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C8A6FF]">
            Bosta
          </span>
          <span className="font-mono text-[10px] text-[var(--nl-text-mute)]">
            AWB-9847203451
          </span>
        </div>

        <div className="my-4 flex items-end justify-center gap-[3px]">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] bg-[var(--nl-text)]"
              style={{
                height: `${24 + ((i * 7) % 28)}px`,
                opacity: i % 3 === 0 ? 1 : 0.5,
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-white/[0.04] px-3 py-2">
            <div className="text-[10px] text-[var(--nl-text-mute)]">الطلب</div>
            <div className="font-mono font-semibold text-[var(--nl-text)]">#ORD-1284</div>
          </div>
          <div className="rounded-lg bg-white/[0.04] px-3 py-2">
            <div className="text-[10px] text-[var(--nl-text-mute)]">المبلغ</div>
            <div className="font-mono font-semibold text-[var(--nl-text)]">845 جنيه</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-[#22C55E]/25 bg-[#22C55E]/[0.06] p-3">
        <LiaCheckCircleSolid size={20} className="text-[#22C55E]" />
        <span className="text-sm text-[var(--nl-text)]">تم تسليم الشحنة للمندوب</span>
        <span className="mr-auto font-mono text-[11px] text-[var(--nl-text-mute)]">
          47 شحنة جاهزة
        </span>
      </div>
    </div>
  );
}

function SceneTracking() {
  const milestones = [
    { label: 'تأكيد', state: 'done' },
    { label: 'استلام', state: 'done' },
    { label: 'في الطريق', state: 'active' },
    { label: 'تسليم', state: 'todo' },
  ];
  const rows = [
    { id: '#ORD-1284', cust: 'محمد علي', state: 'في الطريق', color: '#FEBC2E' },
    { id: '#ORD-1285', cust: 'سارة محمود', state: 'تم التسليم', color: '#22C55E' },
    { id: '#ORD-1286', cust: 'أحمد سيد', state: 'لم يتم الرد', color: '#EF4444' },
    { id: '#ORD-1287', cust: 'منى السيد', state: 'تم التسليم', color: '#22C55E' },
  ];
  return (
    <div className="space-y-4">
      <SceneHeader Icon={LiaMapMarkedAltSolid} label="Tracking · Live" />

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          {milestones.map((m, i) => (
            <div key={m.label} className="flex flex-col items-center">
              <motion.span
                className={clsx(
                  'h-3 w-3 rounded-full',
                  m.state === 'done'
                    ? 'bg-[#22C55E]'
                    : m.state === 'active'
                      ? 'bg-[#FEBC2E]'
                      : 'border-2 border-white/15',
                )}
                animate={m.state === 'active' ? { scale: [1, 1.3, 1] } : undefined}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              <span className="mt-1.5 text-[10px] text-[var(--nl-text-mute)]">{m.label}</span>
              {i < milestones.length - 1 && (
                <span className="absolute" />
              )}
            </div>
          ))}
        </div>
        <div className="relative mt-[-22px] h-px w-full bg-white/[0.06]">
          <motion.div
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-[#FEBC2E] via-[#22C55E] to-[#22C55E]"
            initial={{ width: '0%' }}
            animate={{ width: '65%' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-6 text-center text-[10px] text-[var(--nl-text-mute)]">
          API webhook · آخر تحديث منذ 2 دقيقة
        </div>
      </div>

      <div className="space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-[11px]"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.color }} />
              <span className="font-mono font-semibold text-[var(--nl-text)]">{r.id}</span>
              <span className="text-[var(--nl-text-mute)]">{r.cust}</span>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px]"
              style={{ background: r.color + '22', color: r.color }}
            >
              {r.state}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneInvoice() {
  const items = [
    { name: 'T-Shirt M', qty: 20, price: 80 },
    { name: 'T-Shirt L', qty: 15, price: 80 },
    { name: 'Hoodie', qty: 10, price: 220 },
  ];
  const total = items.reduce((s, it) => s + it.qty * it.price, 0);
  return (
    <div className="space-y-4">
      <SceneHeader Icon={LiaFileInvoiceDollarSolid} label="Invoice · #PO-1042" />

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-[var(--nl-text-mute)]">المورد</div>
            <div className="text-sm font-semibold text-[var(--nl-text)]">شركة الأنوار</div>
          </div>
          <div className="text-left">
            <div className="text-[10px] text-[var(--nl-text-mute)]">التاريخ</div>
            <div className="font-mono text-sm text-[var(--nl-text)]">2026-05-11</div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/5">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/5 bg-white/[0.02] px-3 py-2 text-[10px] uppercase tracking-wider text-[var(--nl-text-mute)]">
            <span>المنتج</span>
            <span>العدد</span>
            <span>السعر</span>
          </div>
          {items.map((it, i) => (
            <div
              key={it.name}
              className={clsx(
                'grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2 text-xs',
                i % 2 === 0 ? 'bg-white/[0.01]' : '',
              )}
            >
              <span className="text-[var(--nl-text)]">{it.name}</span>
              <span className="font-mono text-[var(--nl-text-mute)]">×{it.qty}</span>
              <span className="font-mono text-[var(--nl-text)]">{it.price} ج</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
          <span className="text-sm text-[var(--nl-text-mute)]">الإجمالي</span>
          <span className="font-mono text-2xl font-bold text-[var(--nl-text)]">
            {total.toLocaleString('en-US')}{' '}
            <span className="text-xs font-normal text-[var(--nl-text-mute)]">جنيه</span>
          </span>
        </div>
      </div>

      <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#7B2CFF] to-[#3A0CA3] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(123,44,255,0.6)]">
        <LiaDownloadSolid />
        حفظ الفاتورة
      </button>
    </div>
  );
}

function SceneTransfer() {
  const items = [
    { name: 'T-Shirt M', qty: 12 },
    { name: 'Hoodie', qty: 8 },
    { name: 'Cap', qty: 20 },
  ];
  return (
    <div className="space-y-4">
      <SceneHeader Icon={LiaWarehouseSolid} label="Inventory Transfer · #TR-088" />

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 text-center">
          <LiaWarehouseSolid size={26} className="mx-auto text-[var(--nl-text-mute)]" />
          <div className="mt-1.5 text-[10px] uppercase tracking-wider text-[var(--nl-text-mute)]">من</div>
          <div className="text-sm font-semibold text-[var(--nl-text)]">مخزن A</div>
          <div className="font-mono text-[10px] text-[var(--nl-text-mute)]">Cairo</div>
        </div>

        <motion.div
          animate={{ x: [-6, 6, -6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="grid h-10 w-10 place-items-center rounded-full border border-[#7B2CFF]/40 bg-[#0A0E1E] text-[#C8A6FF] shadow-[0_0_24px_-6px_rgba(123,44,255,0.6)]"
        >
          <LiaArrowLeftSolid size={18} />
        </motion.div>

        <div className="rounded-2xl border border-[#7B2CFF]/30 bg-[#7B2CFF]/[0.08] p-3.5 text-center">
          <LiaWarehouseSolid size={26} className="mx-auto text-[#C8A6FF]" />
          <div className="mt-1.5 text-[10px] uppercase tracking-wider text-[var(--nl-text-mute)]">إلى</div>
          <div className="text-sm font-semibold text-[var(--nl-text)]">مخزن B</div>
          <div className="font-mono text-[10px] text-[var(--nl-text-mute)]">Giza</div>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs text-[var(--nl-text-mute)]">عناصر التحويل</span>
          <span className="font-mono text-xs text-[var(--nl-text-mute)]">3 منتجات · 40 قطعة</span>
        </div>
        <div className="space-y-1.5">
          {items.map((it) => (
            <div
              key={it.name}
              className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 text-[var(--nl-text)]">
                <LiaBoxSolid size={14} className="text-[var(--nl-text-mute)]" />
                <span>{it.name}</span>
              </div>
              <span className="font-mono text-[var(--nl-text-mute)]">×{it.qty}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-[var(--nl-text)] hover:border-[#7B2CFF]/40">
        <LiaPlaySolid />
        طباعة فاتورة الانتقال
      </button>
    </div>
  );
}
