'use client';

import {
  LiaShieldAltSolid,
  LiaDatabaseSolid,
  LiaCogsSolid,
  LiaLockSolid,
  LiaUserShieldSolid,
  LiaFileAltSolid,
  LiaHeadsetSolid,
  LiaCheckCircleSolid,
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
    Icon: LiaDatabaseSolid,
    title: 'المعلومات التي نجمعها',
    intro: 'نحن نجمع فقط البيانات الضرورية لتشغيل حسابك وتقديم الخدمة لك، وتشمل:',
    items: [
      {
        label: 'معلومات الحساب',
        body: 'مثل الاسم، البريد الإلكتروني، ورقم الهاتف.',
      },
      {
        label: 'بيانات العمل',
        body: 'البيانات اللي بتدخلها (المنتجات، الطلبات، بيانات العملاء، والمخزون) لغرض المعالجة والتنظيم فقط.',
      },
      {
        label: 'بيانات الاستخدام',
        body: 'معلومات تقنية حول كيفية تفاعلك مع السيستم لتحسين الأداء وتجربة المستخدم.',
      },
    ],
    accent: '#7B2CFF',
  },
  {
    num: '02',
    Icon: LiaCogsSolid,
    title: 'كيف نستخدم بياناتك؟',
    intro: 'بياناتك تُستخدم لغرض واحد فقط وهو خدمتك، وذلك من خلال:',
    items: [
      {
        label: 'إدارة العمليات',
        body: 'تمكينك من إدارة عملياتك التشغيلية وتحليل مبيعاتك.',
      },
      {
        label: 'الدعم الفني',
        body: 'تقديم الدعم الفني وحلّ المشكلات التقنية.',
      },
      {
        label: 'تنبيهات الحساب',
        body: 'إرسال تحديثات النظام والتنبيهات الهامة المتعلقة بحسابك.',
      },
    ],
    accent: '#9D4EDD',
  },
  {
    num: '03',
    Icon: LiaLockSolid,
    title: 'حماية وخصوصية البيانات',
    intro: null,
    items: [
      {
        label: 'ملكية البيانات',
        body: 'إنت صاحب الحق الوحيد في بياناتك. أورديرا ما بتملكش هذه البيانات ولا بتبيعها أو تشاركها مع أي جهة خارجية أو طرف ثالث لأغراض تسويقية.',
      },
      {
        label: 'التشفير',
        body: 'نستخدم تقنيات تشفير متطورة لحماية بياناتك من الوصول غير المصرح به أو الفقدان.',
      },
      {
        label: 'سرية فريق العمل',
        body: 'جميع أعضاء فريقنا (الـ 25 شخص) ملتزمين باتفاقيات صارمة للحفاظ على سرية المعلومات، والوصول للبيانات بيكون فقط في حالات الدعم الفني وبناءً على طلبك.',
      },
    ],
    accent: '#22C55E',
  },
  {
    num: '04',
    Icon: LiaUserShieldSolid,
    title: 'مسؤولية التاجر',
    intro: null,
    items: [
      {
        label: 'سرية كلمة المرور',
        body: 'إنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بحسابك وعن أي نشاط يتم من خلال حسابك.',
      },
      {
        label: 'كلمات مرور قوية',
        body: 'ننصح دائماً باستخدام كلمات مرور قوية وعدم مشاركتها مع أي شخص خارج فريق عملك المُصرّح له.',
      },
    ],
    accent: '#FEBC2E',
  },
  {
    num: '05',
    Icon: LiaFileAltSolid,
    title: 'التعديلات على سياسة الخصوصية',
    intro: null,
    items: [
      {
        label: 'تحديث السياسة',
        body: 'ممكن نقوم بتحديث هذه السياسة من وقت لآخر لمواكبة التطورات التقنية أو القانونية.',
      },
      {
        label: 'إخطار التغييرات',
        body: 'هيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال لوحة التحكم الخاصة بك.',
      },
    ],
    accent: '#7B2CFF',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="relative overflow-hidden">
      <NewNav />

      <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
        <AuroraBackground variant="subtle" />

        <div className="relative z-10 mx-auto max-w-5xl px-5 text-center">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-base uppercase tracking-[0.3em] text-[var(--nl-text-mute)] backdrop-blur-md">
              <LiaShieldAltSolid className="text-[#7B2CFF]" />
              الخصوصية والأمان
            </span>
          </RevealOnScroll>

          <RevealOnScroll delay={0.05}>
            <h1 className="mt-7 text-4xl font-bold leading-[1.15] tracking-tight text-[var(--nl-text)] md:text-6xl lg:text-7xl">
              سياسة{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-[#9D4EDD] via-[#7B2CFF] to-[#5d24e1] bg-clip-text text-transparent">
                  الخصوصية
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
              في أورديرا، إحنا فاهمين إن بيانات عملك هي أغلى ما تملك. علشان كده،
              إحنا ملتزمين بأقصى معايير الحماية والشفافية في التعامل مع
              المعلومات اللي بتتشارك على منصتنا.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <div className="mx-auto mt-7 inline-flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/[0.06] px-3 py-1 text-base font-medium text-[#22C55E]">
                <LiaCheckCircleSolid />
                بياناتك ملكك
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7B2CFF]/25 bg-[#7B2CFF]/[0.06] px-3 py-1 text-base font-medium text-[#C8A6FF]">
                <LiaLockSolid />
                تشفير متقدم
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-base font-medium text-[var(--nl-text)]">
                <LiaUserShieldSolid />
                صفر بيع للبيانات
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
                                className="mt-1 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-base font-bold"
                                style={{
                                  background: `${s.accent}20`,
                                  color: s.accent,
                                }}
                              >
                                <LiaCheckCircleSolid size={16} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <h3
                                  className="text-base font-semibold text-[var(--nl-text)] md:text-lg"
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
              تواصل معنا
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
              لو عندك أي استفسار حول كيفية تعاملنا مع بياناتك، تقدر تتواصل مع
              فريق الدعم الفني مباشرة.
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
                تواصل مع الدعم الفني
                <LiaArrowLeftSolid />
              </MagneticButton>
              <MagneticButton
                variant="outline"
                strength={8}
                className="!px-7 !py-4"
                onClick={() => (window.location.href = '/about-us')}
              >
                تعرّف علينا أكتر
              </MagneticButton>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <CtaFooter />
    </main>
  );
}
