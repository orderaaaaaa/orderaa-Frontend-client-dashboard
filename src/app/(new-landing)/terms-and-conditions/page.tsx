'use client';

import {
  LiaFileContractSolid,
  LiaCogsSolid,
  LiaUserPlusSolid,
  LiaCopyrightSolid,
  LiaCreditCardSolid,
  LiaBalanceScaleSolid,
  LiaSignOutAltSolid,
  LiaSyncSolid,
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
    Icon: LiaCogsSolid,
    title: 'وصف الخدمة',
    intro: null,
    items: [
      {
        label: 'منصة SaaS',
        body: 'أورديرا هي منصة برمجية تعمل بنظام (SaaS) لإدارة موارد التجارة الإلكترونية.',
      },
      {
        label: 'الأدوات المتوفرة',
        body: 'نوفّر الأدوات اللازمة لتنظيم المخزون، الطلبات، والتحليلات.',
      },
      {
        label: 'حدود الخدمة',
        body: 'ما بنتدخّلش في طبيعة المنتجات اللي بتبيعها أو علاقتك المباشرة مع عملائك.',
      },
    ],
    accent: '#7B2CFF',
  },
  {
    num: '02',
    Icon: LiaUserPlusSolid,
    title: 'إنشاء الحساب والمسؤولية',
    intro: null,
    items: [
      {
        label: 'دقة البيانات',
        body: 'لازم تكون كل البيانات المقدّمة وقت التسجيل دقيقة وصحيحة.',
      },
      {
        label: 'حماية الحساب',
        body: 'إنت المسؤول الوحيد عن حماية حسابك وأي نشاط يتم من خلاله.',
      },
      {
        label: 'الاستخدام القانوني',
        body: 'يُحظر استخدام النظام في أي أنشطة غير قانونية أو تخالف قوانين التجارة الإلكترونية المعمول بها.',
      },
    ],
    accent: '#9D4EDD',
  },
  {
    num: '03',
    Icon: LiaCopyrightSolid,
    title: 'الملكية الفكرية',
    intro: null,
    items: [
      {
        label: 'ملكية المنصة',
        body: 'تظلّ منصة أورديرا بكل أكوادها وتصميماتها وعلامتها التجارية ملكاً حصرياً لنا.',
      },
      {
        label: 'ملكية بياناتك',
        body: 'كل البيانات اللي بترفعها (بيانات العملاء، المبيعات، التقارير) ملكك إنت، وما يحقّلناش التصرّف فيها.',
      },
    ],
    accent: '#22C55E',
  },
  {
    num: '04',
    Icon: LiaCreditCardSolid,
    title: 'الاشتراكات والدفع',
    intro: null,
    items: [
      {
        label: 'تفعيل الخدمة',
        body: 'يتم تفعيل الخدمة بناءً على باقة الاشتراك اللي بتختارها.',
      },
      {
        label: 'التزام السداد',
        body: 'العميل ملتزم بدفع رسوم الاشتراك في المواعيد المحدّدة لضمان استمرار الخدمة.',
      },
      {
        label: 'تعليق الخدمة',
        body: 'في حال التأخّر عن السداد، يحقّ لـ أورديرا تعليق الخدمة مؤقّتاً لحدّ ما يتمّ تسوية المستحقّات.',
      },
    ],
    accent: '#FEBC2E',
  },
  {
    num: '05',
    Icon: LiaBalanceScaleSolid,
    title: 'حدود المسؤولية',
    intro: null,
    items: [
      {
        label: 'كفاءة النظام',
        body: 'بنبذل أقصى جهد لضمان عمل النظام بكفاءة 99.9%، لكن مش مسؤولين عن أي خسائر ناتجة عن انقطاع الخدمة لأسباب تقنية خارجة عن إرادتنا أو بسبب مشاكل في شبكة الإنترنت عند المستخدم.',
      },
      {
        label: 'دور الأداة',
        body: 'أورديرا هي أداة تنظيمية. القرار النهائي في التوسّع أو إدارة فريقك يرجع لك بناءً على تحليلك للبيانات اللي يوفّرها النظام.',
      },
    ],
    accent: '#F97316',
  },
  {
    num: '06',
    Icon: LiaSignOutAltSolid,
    title: 'إلغاء الخدمة',
    intro: null,
    items: [
      {
        label: 'حقّ الإلغاء',
        body: 'يحقّ لك إلغاء اشتراكك في أي وقت. عند الإلغاء، المنصة بتلتزم بإتاحة الفرصة ليك لتصدير بياناتك قبل إغلاق الحساب نهائياً.',
      },
      {
        label: 'حقّ المنصة',
        body: 'يحقّ لـ أورديرا إنهاء الخدمة في حال مخالفة أي شرط من الشروط المذكورة فوق.',
      },
    ],
    accent: '#EF4444',
  },
  {
    num: '07',
    Icon: LiaSyncSolid,
    title: 'التعديلات',
    intro: null,
    items: [
      {
        label: 'حقّ التعديل',
        body: 'نحتفظ بالحقّ في تعديل هذه الشروط لتطوير الخدمة.',
      },
      {
        label: 'الإبلاغ المسبق',
        body: 'هيتمّ إبلاغ المشتركين بأي تعديلات جوهرية قبل تطبيقها بفترة كافية.',
      },
    ],
    accent: '#7B2CFF',
  },
];

export default function TermsPage() {
  return (
    <main className="relative overflow-hidden">
      <NewNav />

      <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
        <AuroraBackground variant="subtle" />

        <div className="relative z-10 mx-auto max-w-5xl px-5 text-center">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-base uppercase tracking-[0.3em] text-[var(--nl-text-mute)] backdrop-blur-md">
              <LiaFileContractSolid className="text-[#7B2CFF]" />
              الاتفاقية القانونية
            </span>
          </RevealOnScroll>

          <RevealOnScroll delay={0.05}>
            <h1 className="mt-7 text-4xl font-bold leading-[1.15] tracking-tight text-[var(--nl-text)] md:text-6xl lg:text-7xl">
              الشروط{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-[#9D4EDD] via-[#7B2CFF] to-[#5d24e1] bg-clip-text text-transparent">
                  والأحكام
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
              باستخدامك لمنصة أورديرا، إنت بتوافق على الالتزام بالشروط والأحكام
              التالية. يُرجى قراءتها بعناية لضمان فهم حقوقك وواجباتك.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <div className="mx-auto mt-7 inline-flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/[0.06] px-3 py-1 text-base font-medium text-[#22C55E]">
                <LiaCheckCircleSolid />
                شفافية كاملة
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7B2CFF]/25 bg-[#7B2CFF]/[0.06] px-3 py-1 text-base font-medium text-[#C8A6FF]">
                <LiaFileContractSolid />
                7 بنود واضحة
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-base font-medium text-[var(--nl-text)]">
                <LiaBalanceScaleSolid />
                حقوق مكفولة
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
              <RevealItem key={s.num} delay={i * 0.04}>
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
              عندك سؤال قانوني؟
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
              لو فيه أي بند مش واضح أو محتاج توضيح أكتر، تواصل مع فريق الدعم
              مباشرة وهنرد عليك في أسرع وقت.
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
                تواصل مع الدعم
                <LiaArrowLeftSolid />
              </MagneticButton>
              <MagneticButton
                variant="outline"
                strength={8}
                className="!px-7 !py-4"
                onClick={() => (window.location.href = '/privacy-policy')}
              >
                اقرأ سياسة الخصوصية
              </MagneticButton>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <CtaFooter />
    </main>
  );
}
