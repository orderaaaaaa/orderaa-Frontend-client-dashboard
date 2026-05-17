'use client';

import {
  LiaExclamationTriangleSolid,
  LiaUserCircleSolid,
  LiaShieldAltSolid,
  LiaBoltSolid,
  LiaCoinsSolid,
  LiaCheckCircleSolid,
  LiaPhoneVolumeSolid,
  LiaBanSolid,
} from 'react-icons/lia';
import { RevealOnScroll } from './primitives/RevealOnScroll';
import { RevealItem } from './primitives/RevealItem';

const valueProps = [
  {
    Icon: LiaBoltSolid,
    title: 'تنبيه فوري قبل التأكيد',
    body: 'لحظة ما يفتح الكول سنتر الأوردر، السيستم بيلفت نظره فوراً إنّ العميل ده طلب قبل كده — قبل ما يكلّمه.',
    accent: '#7B2CFF',
  },
  {
    Icon: LiaBanSolid,
    title: 'صفر شحنات مكرّرة',
    body: 'مفيش أوردرين بيتشحنوا لنفس العميل بالغلط، ومفيش خسارة في فلوس الشحن والتغليف من غير لزوم.',
    accent: '#EF4444',
  },
  {
    Icon: LiaCoinsSolid,
    title: 'بتحمي فلوسك',
    body: 'كل أوردر مكرّر بتمنعه = شحن + تغليف + موظفين بتوفّرهم. الميزة دي وحدها بتوفّر مئات الجنيهات شهرياً.',
    accent: '#22C55E',
  },
];

const previousOrders = [
  { id: '#طلب-2814', date: 'منذ 4 أيام', amount: '845 ج.م', status: 'تم التسليم', color: '#22C55E' },
  { id: '#طلب-2799', date: 'منذ 11 يوم', amount: '1,200 ج.م', status: 'تم التسليم', color: '#22C55E' },
];

export function DuplicateOrderSpotlight() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
        <div className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#EF4444]/[0.07] blur-[140px]" />
        <div className="absolute -right-40 bottom-1/4 h-[460px] w-[460px] rounded-full bg-[#7B2CFF]/[0.08] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5">
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#7B2CFF]/30 bg-[#7B2CFF]/[0.06] px-4 py-1.5 text-base font-medium uppercase tracking-[0.25em] text-[#C8A6FF] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9D4EDD] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9D4EDD]" />
            </span>
            ميزة حصرية في أورديرا
          </span>

          <h2 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-[var(--nl-text)] md:text-5xl lg:text-6xl">
            هل العميل ده{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-l from-[#FF6B6B] via-[#9D4EDD] to-[#7B2CFF] bg-clip-text text-transparent">
                طلب قبل كده؟
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-l from-[#FF6B6B] via-[#9D4EDD] to-[#7B2CFF] nl-anim-scale-x-in"
                style={{ animationDelay: '0.3s' }}
              />
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
            أورديرا بيكشف تلقائياً لو العميل طلب أوردر قبل كده — وبيلفت نظر
            الكول سنتر قبل تأكيد الأوردر الجديد. مفيش شحنات مكرّرة، ومفيش فلوس
            بتروح من غير لزوم.
          </p>
        </RevealOnScroll>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
          <RevealOnScroll delay={0.05}>
            <DetectionMock />
          </RevealOnScroll>

          <div className="space-y-4">
            {valueProps.map((v, i) => (
              <RevealItem key={v.title} delay={0.1 + i * 0.07}>
                <div
                  className="group relative overflow-hidden rounded-2xl border bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:-translate-y-1 md:p-6"
                  style={{ borderColor: `${v.accent}30` }}
                >
                  <div
                    aria-hidden
                    className="absolute -right-12 -top-12 h-28 w-28 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-80"
                    style={{ background: `${v.accent}30` }}
                  />
                  <div className="relative flex items-start gap-4">
                    <div
                      className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl ring-1"
                      style={{
                        background: `linear-gradient(135deg, ${v.accent}30, ${v.accent}10)`,
                        color: v.accent,
                        borderColor: `${v.accent}50`,
                      }}
                    >
                      <v.Icon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-[var(--nl-text)] md:text-xl">
                        {v.title}
                      </h3>
                      <p className="mt-2 text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
                        {v.body}
                      </p>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}

            <RevealItem delay={0.35}>
              <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-l from-[#7B2CFF]/[0.08] via-transparent to-transparent px-5 py-4 text-base text-[var(--nl-text)]">
                <span className="font-mono text-[#C8A6FF]">النتيجة: </span>
                توفير حقيقي في الفلوس + ثقة أعلى عند كل تأكيد + رضا أعلى من
                العملاء الموجودين فعلاً في قاعدة بياناتك.
              </div>
            </RevealItem>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetectionMock() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-[#FF6B6B]/20 via-[#7B2CFF]/15 to-[#3A0CA3]/20 blur-2xl"
      />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#11162B] to-[#0A0E1E] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="mx-auto rounded-md bg-white/[0.04] px-3 py-0.5 text-base text-[var(--nl-text-mute)]">
            أورديرا · فتح طلب جديد
          </span>
          <span className="font-mono text-base text-[var(--nl-text-mute)]/60">
            #طلب-2941
          </span>
        </div>

        <div className="space-y-4 p-5 md:p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#7B2CFF]/30 to-[#3A0CA3]/15 text-[#C8A6FF] ring-1 ring-[#7B2CFF]/30">
              <LiaUserCircleSolid size={28} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold text-[var(--nl-text)]">
                محمد علي السيد
              </div>
              <div className="font-mono text-base text-[var(--nl-text-mute)]">
                +20 100 234 5678 · القاهرة
              </div>
            </div>
            <span className="rounded-full bg-[#22C55E]/15 px-3 py-1 text-base font-medium text-[#22C55E]">
              VIP
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[#EF4444]/30 bg-gradient-to-l from-[#EF4444]/[0.1] via-[#EF4444]/[0.04] to-transparent p-4 nl-anim-fade-in-up">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#EF4444]/20 text-[#FF6B6B] nl-anim-pulse-scale">
                <LiaExclamationTriangleSolid size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#FF6B6B]">
                    تنبيه — العميل ده طلب قبل كده
                  </h3>
                  <span className="rounded-full bg-[#EF4444]/20 px-2 py-0.5 font-mono text-base font-bold text-[#FF6B6B]">
                    ×2
                  </span>
                </div>
                <p className="mt-1.5 text-base leading-relaxed text-[var(--nl-text-mute)]">
                  لاقينا أوردرين سابقين لنفس العميل — راجعهم قبل ما تأكّد الأوردر
                  الجديد.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {previousOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-base"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: o.color }}
                    />
                    <span className="font-mono font-semibold text-[var(--nl-text)]">
                      {o.id}
                    </span>
                    <span className="text-[var(--nl-text-mute)]">{o.date}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[var(--nl-text)]">
                      {o.amount}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-base font-medium"
                      style={{
                        background: `${o.color}22`,
                        color: o.color,
                      }}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-base text-[var(--nl-text-mute)]">
                نسبة تسليم العميل
              </span>
              <span className="font-mono text-lg font-bold text-[#22C55E]">
                92%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[#22C55E] to-[#16A34A]"
                style={{ width: '92%' }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#FEBC2E]/30 bg-[#FEBC2E]/[0.08] px-4 py-2.5 text-base font-semibold text-[#FEBC2E] hover:bg-[#FEBC2E]/[0.14]"
              disabled
            >
              <LiaShieldAltSolid />
              راجع الأوردرات السابقة
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/[0.08] px-4 py-2.5 text-base font-semibold text-[#22C55E] hover:bg-[#22C55E]/[0.14]"
              disabled
            >
              <LiaPhoneVolumeSolid />
              اتّصل بالعميل أولاً
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2 text-base text-[var(--nl-text-mute)]">
            <LiaCheckCircleSolid className="text-[#22C55E]" size={16} />
            التأكيد متاح بعد المراجعة
          </div>
        </div>
      </div>
    </div>
  );
}
