'use client';

import {
  LiaUndoAltSolid,
  LiaClockSolid,
  LiaMoneyBillWaveSolid,
  LiaTimesCircleSolid,
  LiaPowerOffSolid,
  LiaEnvelopeOpenSolid,
  LiaCheckCircleSolid,
  LiaHeadsetSolid,
  LiaArrowLeftSolid,
} from 'react-icons/lia';
import { NewNav } from '../components/NewNav';
import { AuroraBackground } from '../components/AuroraBackground';
import { RevealOnScroll } from '../components/primitives/RevealOnScroll';
import { RevealItem } from '../components/primitives/RevealItem';
import { GlowCard } from '../components/primitives/GlowCard';
import { MagneticButton } from '../components/primitives/MagneticButton';
import { CtaFooter } from '../components/CtaFooter';

const sections = [
  {
    num: '01',
    Icon: LiaClockSolid,
    title: 'الفترة التجريبية',
    intro: null,
    items: [
      {
        label: 'تجربة مجانية كاملة',
        body: 'بنوفّر فترة تجريبية مجانية لكل العملاء الجدد، علشان تقدر تفحص كل مميزات النظام وتتأكد إنه بيلبّي احتياجات البيزنس قبل الالتزام باشتراك كامل.',
      },
    ],
    accent: '#7B2CFF',
  },
  {
    num: '02',
    Icon: LiaMoneyBillWaveSolid,
    title: 'طلبات الاسترداد',
    intro: null,
    items: [
      {
        label: 'نافذة الاسترداد — 7 أيام',
        body: 'تقدر تطلب استرداد قيمة الاشتراك خلال أول 7 أيام من تاريخ الاشتراك الأول، بشرط وجود عطل تقني جوهري في النظام يمنعك من استخدامه، وما قدرش فريق الدعم الفني يحلّه.',
      },
      {
        label: 'بعد انتهاء النافذة',
        body: 'بعد مرور المدة المحدّدة، ما يحقّش للمشترك المطالبة باسترداد قيمة الاشتراك الحالي — لكن ممكن إلغاء تجديد الاشتراك للفترات القادمة في أي وقت.',
      },
    ],
    accent: '#22C55E',
  },
  {
    num: '03',
    Icon: LiaTimesCircleSolid,
    title: 'الحالات اللي ما يشملهاش الاسترداد',
    intro: null,
    items: [
      {
        label: 'تغيير الرأي',
        body: 'تغيير رأي العميل بعد تفعيل الحساب واستخدامه بالفعل.',
      },
      {
        label: 'مشاكل خارجية',
        body: 'عدم قدرة العميل على استخدام النظام بسبب مشاكل في جهازه الشخصي أو اتصال الإنترنت لديه.',
      },
      {
        label: 'انتهاء نافذة الاسترداد',
        body: 'الاشتراكات اللي اتلغت بعد مرور الفترة المسموح بها للاسترداد.',
      },
    ],
    accent: '#EF4444',
  },
  {
    num: '04',
    Icon: LiaPowerOffSolid,
    title: 'إلغاء الاشتراك',
    intro: null,
    items: [
      {
        label: 'إلغاء في أي وقت',
        body: 'تقدر تلغي اشتراكك في أي وقت من خلال لوحة التحكم — بدون أي تعقيدات.',
      },
      {
        label: 'استمرار الخدمة',
        body: 'عند الإلغاء، حسابك هيفضل فعّال لحدّ نهاية مدة الاشتراك المدفوعة.',
      },
      {
        label: 'بدون رسوم مستقبلية',
        body: 'ما هيتمّش سحب أي مبالغ إضافية في المستقبل بعد الإلغاء.',
      },
    ],
    accent: '#FEBC2E',
  },
  {
    num: '05',
    Icon: LiaEnvelopeOpenSolid,
    title: 'كيفية تقديم طلب استرداد',
    intro: null,
    items: [
      {
        label: 'قنوات التواصل',
        body: 'تواصل مع فريق الدعم الفني عبر البريد الإلكتروني الرسمي أو أرقام التواصل المتاحة.',
      },
      {
        label: 'تفاصيل الطلب',
        body: 'وضّح سبب الطلب وزوّدنا ببيانات الحساب علشان نقدر نراجع الحالة بدقة.',
      },
      {
        label: 'زمن المراجعة والردّ',
        body: 'هيتمّ مراجعة الطلب والردّ عليك خلال 3 أيام عمل.',
      },
    ],
    accent: '#9D4EDD',
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="relative overflow-hidden">
      <NewNav />

      <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
        <AuroraBackground variant="subtle" />

        <div className="relative z-10 mx-auto max-w-5xl px-5 text-center">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-base uppercase tracking-[0.3em] text-[var(--nl-text-mute)] backdrop-blur-md">
              <LiaUndoAltSolid className="text-[#7B2CFF]" />
              الاشتراكات والاسترداد
            </span>
          </RevealOnScroll>

          <RevealOnScroll delay={0.05}>
            <h1 className="mt-7 text-4xl font-bold leading-[1.15] tracking-tight text-[var(--nl-text)] md:text-6xl lg:text-7xl">
              سياسة{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-[#9D4EDD] via-[#7B2CFF] to-[#5d24e1] bg-clip-text text-transparent">
                  الاسترداد
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-l from-[#9D4EDD] via-[#7B2CFF] to-[#5d24e1] nl-anim-scale-x-in"
                  style={{ animationDelay: '0.4s' }}
                />
              </span>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15}>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
              إحنا في أورديرا بنسعى دايماً لتقديم خدمة تنال رضاكم وتساعدكم على
              تطوير أعمالكم. وبما إننا بنقدّم خدمة رقمية تعتمد على الاشتراكات،
              فسياسة الاسترداد بتخضع للضوابط التالية.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <div className="mx-auto mt-7 inline-flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7B2CFF]/25 bg-[#7B2CFF]/[0.06] px-3 py-1 text-base font-medium text-[#C8A6FF]">
                <LiaClockSolid />
                تجربة مجانية أولاً
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/[0.06] px-3 py-1 text-base font-medium text-[#22C55E]">
                <LiaCheckCircleSolid />
                نافذة استرداد 7 أيام
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-base font-medium text-[var(--nl-text)]">
                <LiaHeadsetSolid />
                ردّ خلال 3 أيام عمل
              </span>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="relative py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[#7B2CFF]/[0.06] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-5">
          <div className="space-y-6">
            {sections.map((s, i) => (
              <RevealItem key={s.num} delay={i * 0.05}>
                <GlowCard className="h-full" glowColor={`${s.accent}44`}>
                  <article className="relative p-6 md:p-10">
                    <div className="flex items-start gap-5 md:gap-6">
                      <div className="flex flex-shrink-0 flex-col items-center gap-3">
                        <span
                          className="font-mono text-2xl font-bold leading-none md:text-3xl"
                          style={{ color: `${s.accent}50` }}
                        >
                          {s.num}
                        </span>
                        <span
                          className="grid h-14 w-14 place-items-center rounded-2xl ring-1 md:h-16 md:w-16"
                          style={{
                            background: `linear-gradient(135deg, ${s.accent}30, ${s.accent}10)`,
                            color: s.accent,
                            borderColor: `${s.accent}50`,
                          }}
                        >
                          <s.Icon size={28} />
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-bold leading-snug text-[var(--nl-text)] md:text-3xl">
                          {s.title}
                        </h2>
                        <div
                          className="mt-3 h-px w-16"
                          style={{
                            background: `linear-gradient(to left, transparent, ${s.accent}80)`,
                          }}
                        />

                        {s.intro && (
                          <p className="mt-5 text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
                            {s.intro}
                          </p>
                        )}

                        <ul className="mt-5 space-y-3.5">
                          {s.items.map((item) => (
                            <li
                              key={item.label}
                              className="flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 md:gap-4 md:p-5"
                            >
                              <span
                                className="mt-1 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full"
                                style={{
                                  background: `${s.accent}20`,
                                  color: s.accent,
                                }}
                              >
                                <LiaCheckCircleSolid size={16} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <h3
                                  className="text-base font-semibold md:text-lg"
                                  style={{ color: s.accent }}
                                >
                                  {item.label}
                                </h3>
                                <p className="mt-1 text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
                                  {item.body}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                </GlowCard>
              </RevealItem>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/[0.05] bg-gradient-to-b from-[#0A0E1E] via-[#11162B] to-[#0A0E1E] py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(123,44,255,0.18)_0%,transparent_60%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <RevealOnScroll>
            <div className="inline-grid h-16 w-16 place-items-center rounded-2xl border border-[#7B2CFF]/30 bg-gradient-to-br from-[#1B0F3D] to-[#0A0E1E] text-[#C8A6FF] shadow-[0_0_40px_-10px_rgba(123,44,255,0.6)]">
              <LiaHeadsetSolid size={30} />
            </div>
            <h2 className="mt-6 text-3xl font-bold leading-tight text-[var(--nl-text)] md:text-4xl">
              عاوز تقدّم طلب استرداد؟
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
              تواصل مع فريق الدعم الفني وزوّدنا بسبب الطلب وبيانات حسابك،
              وهنرجعلك بمراجعة كاملة خلال 3 أيام عمل.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticButton
                variant="primary"
                className="!px-8 !py-4 !text-base"
                onClick={() =>
                  window.open(
                    'https://wa.me/201283337434',
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                قدّم طلب استرداد
                <LiaArrowLeftSolid />
              </MagneticButton>
              <MagneticButton
                variant="outline"
                strength={8}
                className="!px-7 !py-4"
                onClick={() => (window.location.href = '/terms-and-conditions')}
              >
                اقرأ الشروط والأحكام
              </MagneticButton>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <CtaFooter />
    </main>
  );
}
