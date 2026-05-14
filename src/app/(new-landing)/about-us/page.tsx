'use client';

import {
  LiaQuoteRightSolid,
  LiaExclamationCircleSolid,
  LiaCompassSolid,
  LiaUsersSolid,
  LiaChartPieSolid,
  LiaExpandArrowsAltSolid,
  LiaHandshakeSolid,
  LiaCheckSolid,
  LiaArrowLeftSolid,
} from 'react-icons/lia';
import { NewNav } from '../components/NewNav';
import { AuroraBackground } from '../components/AuroraBackground';
import { RevealOnScroll } from '../components/primitives/RevealOnScroll';
import { RevealItem } from '../components/primitives/RevealItem';
import { GlowCard } from '../components/primitives/GlowCard';
import { MagneticButton } from '../components/primitives/MagneticButton';
import { CtaFooter } from '../components/CtaFooter';

const painPoints = [
  'نسب إلغاء مرتفعة',
  'شحنات تايهة وغير قابلة للتتبع',
  'نسبة تسليمات أقل من الطموح',
  'مفيش بيانات حقيقية للمقارنة بين الشهور والسنين',
  'مفيش وضوح أي منتج بيكسّب وأي منتج بيخسّر',
  'كل ما حاولت أتوسّع، السيطرة بتضيع',
];

const values = [
  {
    Icon: LiaChartPieSolid,
    title: 'الوضوح التام',
    body: 'نوفّر لك داتا دقيقة تخلّيك تفهم كل قرش في البيزنس بيروح فين، ومين بيكسب ومين بيخسر.',
    accent: '#7B2CFF',
  },
  {
    Icon: LiaExpandArrowsAltSolid,
    title: 'التحكم في التوسع',
    body: 'نساعدك ترفع حجم شغلك بثقة — نظام التشغيل ثابت وقوي، والتوسّع مش هيوقّعك.',
    accent: '#9D4EDD',
  },
  {
    Icon: LiaHandshakeSolid,
    title: 'دعم حقيقي',
    body: 'لأننا جربنا شعورك بنفسنا، بنهتم بنجاحك كأنه براند خاص بينا.',
    accent: '#22C55E',
  },
];

export default function AboutPage() {
  return (
    <main className="relative overflow-hidden">
      <NewNav />

      <section className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
        <AuroraBackground variant="subtle" />

        <div className="relative z-10 mx-auto max-w-5xl px-5 text-center">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-base uppercase tracking-[0.3em] text-[var(--nl-text-mute)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7B2CFF]" />
              من نحن
            </span>
          </RevealOnScroll>

          <RevealOnScroll delay={0.05}>
            <h1 className="mt-7 text-4xl font-bold leading-[1.15] tracking-tight text-[var(--nl-text)] md:text-6xl lg:text-7xl">
              قصة{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-[#9D4EDD] via-[#7B2CFF] to-[#5d24e1] bg-clip-text text-transparent">
                  أورديرا
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-l from-[#9D4EDD] via-[#7B2CFF] to-[#5d24e1] nl-anim-scale-x-in"
                  style={{ animationDelay: '0.4s' }}
                />
              </span>
              <br />
              من تاجر لتاجر
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
              مش مجرد سيستم — نظام تشغيل اتولد من قلب معاناة تاجر مصري، علشان
              يحلّ نفس المشاكل اللي بتواجهك كل يوم.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="relative py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-1/4 h-[460px] w-[460px] rounded-full bg-[#EF4444]/[0.06] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16">
            <RevealOnScroll>
              <span className="font-mono text-base uppercase tracking-[0.3em] text-[#9D4EDD]">
                الفصل الأول
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[var(--nl-text)] md:text-4xl lg:text-5xl">
                البداية.. من قلب معاناة التاجر
              </h2>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
                <p>
                  أورديرا لم تبدأ كمجرد فكرة برمجية، بل بدأت من واقع تجربة شخصية
                  في إدارة البراندات. كصاحب عمل، كنت أواجه نفس التحديات اللي
                  بتواجهها انت دلوقتي.
                </p>
                <p>
                  كنت أفتقد لوجود بيانات حقيقية تمكّنني من مقارنة أداء السنة
                  الحالية بالماضية، أو حتى تحليل الشهور ببعضها. وكنت أقف حائراً
                  أمام تساؤلات مصيرية:{' '}
                  <span className="text-[var(--nl-text)]">
                    أي منتج يحقق الربح الفعلي وأيها يسبب الخسارة؟ متى الوقت
                    المناسب للتوسع؟ ولماذا كلما حاولت التوسع زادت الخسائر؟
                  </span>
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-[#EF4444]/20 via-transparent to-[#7B2CFF]/20 blur-2xl"
                />
                <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#1A0E15] via-[#0A0E1E] to-[#0A0E1E] p-6 md:p-8">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#EF4444]/25 bg-[#EF4444]/[0.08] text-[#FF6B6B]">
                      <LiaExclamationCircleSolid size={22} />
                    </div>
                    <div>
                      <span className="block font-mono text-base uppercase tracking-[0.25em] text-[#EF4444]/80">
                        نقاط الألم
                      </span>
                      <h3 className="text-base font-semibold text-[var(--nl-text)]">
                        التحديات اللي عشتها بنفسي
                      </h3>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {painPoints.map((p, i) => (
                      <li
                        key={p}
                        className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-base leading-relaxed text-[var(--nl-text-mute)] md:text-base"
                      >
                        <span className="mt-1 font-mono text-base font-bold text-[#FF6B6B]/70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/[0.05] bg-gradient-to-b from-[#0A0E1E] via-[#11162B] to-[#0A0E1E] py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(123,44,255,0.18)_0%,transparent_60%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
          <RevealOnScroll>
            <span className="font-mono text-base uppercase tracking-[0.3em] text-[#9D4EDD]">
              الفصل الثاني
            </span>
            <h2 className="mt-6 text-3xl font-bold leading-tight text-[var(--nl-text)] md:text-5xl">
              المهمة: بناء النظام
              <br />
              <span className="bg-gradient-to-l from-[#9D4EDD] via-[#7B2CFF] to-[#5d24e1] bg-clip-text text-transparent">
                اللي تمنّيته
              </span>
            </h2>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="relative mt-10">
              <LiaQuoteRightSolid
                aria-hidden
                className="absolute -top-4 right-2 text-[#7B2CFF]/30"
                size={40}
              />
              <p className="mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-white/[0.025] px-7 py-7 text-base leading-relaxed text-[var(--nl-text)] backdrop-blur-sm md:text-lg">
                من هنا ولدت الرغبة في التغيير. ماكنتش بدوّر على مجرد سيستم، بل
                على{' '}
                <span className="font-semibold text-[#C8A6FF]">
                  &quot;عقل مدبّر&quot;
                </span>{' '}
                ينظّم العمل ويحطّني على الطريق الصحيح. ولأجل ده، جمّعت فريق من
                الشركاء بيضمّ نخبة من أكبر العقول المصرية في التكنولوجيا
                والتسويق — علشان نصنع الحلّ اللي السوق فاقده.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="relative py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-1/3 h-[460px] w-[460px] rounded-full bg-[#7B2CFF]/[0.08] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <RevealOnScroll className="order-2 lg:order-1">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-[#7B2CFF]/30 via-transparent to-[#3A0CA3]/30 blur-2xl"
                />
                <div className="relative overflow-hidden rounded-3xl border border-[#7B2CFF]/20 bg-gradient-to-b from-[#11162B] to-[#0A0E1E] p-8 md:p-10">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#7B2CFF]/25 to-[#3A0CA3]/15 text-[#C8A6FF] ring-1 ring-[#7B2CFF]/30">
                      <LiaUsersSolid size={22} />
                    </div>
                    <span className="font-mono text-base uppercase tracking-[0.25em] text-[var(--nl-text-mute)]">
                      اليوم
                    </span>
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="font-mono text-7xl font-bold leading-none text-[var(--nl-text)] md:text-8xl">
                      25
                    </span>
                    <span className="text-3xl font-bold leading-none text-[#9D4EDD] md:text-4xl">
                      +
                    </span>
                  </div>
                  <p className="mt-3 text-base text-[var(--nl-text-mute)] md:text-lg">
                    متخصّص يشتغلوا بشغف لتطوير أنظمة بتساعدك تبيع أكتر وبذكاء
                    أكبر.
                  </p>

                  <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-6">
                    {[
                      { label: 'تكنولوجيا', value: 'فريق هندسي' },
                      { label: 'تسويق', value: 'خبرات إعلانية' },
                      { label: 'منتج', value: 'تصميم وتطوير' },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="font-mono text-base uppercase tracking-wider text-[var(--nl-text-mute)]">
                          {s.label}
                        </div>
                        <div className="mt-1 text-base font-semibold text-[var(--nl-text)]">
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1} className="order-1 lg:order-2">
              <span className="font-mono text-base uppercase tracking-[0.3em] text-[#9D4EDD]">
                الفصل الثالث
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[var(--nl-text)] md:text-4xl lg:text-5xl">
                فين أورديرا دلوقتي؟
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
                اليوم، أورديرا بتفخر بفريق عمل يضمّ أكتر من 25 متخصّص بيشتغلوا
                بشغف لتطوير أنظمة بتساعدك تبيع أكتر وبذكاء أكبر.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
                إحنا مش بنبيعلك اشتراك في برنامج — إحنا بننقلّك خبرة سنين من
                المعاناة والنجاح في قالب تكنولوجي سهل الاستخدام.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#22C55E]/25 bg-[#22C55E]/[0.06] px-3 py-1 text-base font-medium text-[#22C55E]">
                  ✓ من تاجر لتاجر
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-base text-[var(--nl-text)]">
                  صنع في مصر
                </span>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-28 md:py-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7B2CFF]/[0.08] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5">
          <RevealOnScroll className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-base uppercase tracking-[0.3em] text-[#9D4EDD]">
              ما نعدك به
            </span>
            <h2 className="mt-4 text-4xl font-bold leading-tight text-[var(--nl-text)] md:text-5xl">
              قيمنا اللي بنشتغل بيها
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
              3 وعود بنلتزم بيها مع كل تاجر بيشتغل معانا — لأنّ التزامنا
              معاك مش مجرد كلام.
            </p>
          </RevealOnScroll>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {values.map((v, i) => (
              <RevealItem key={v.title} delay={i * 0.07}>
                <GlowCard className="h-full" glowColor={`${v.accent}55`}>
                  <div className="flex h-full flex-col p-7 md:p-8">
                    <div className="flex items-center justify-between">
                      <div
                        className="grid h-14 w-14 place-items-center rounded-2xl ring-1"
                        style={{
                          background: `linear-gradient(135deg, ${v.accent}30, ${v.accent}10)`,
                          color: v.accent,
                          borderColor: `${v.accent}50`,
                        }}
                      >
                        <v.Icon size={26} />
                      </div>
                      <span
                        className="font-mono text-3xl font-bold leading-none"
                        style={{ color: `${v.accent}40` }}
                      >
                        0{i + 1}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-bold leading-snug text-[var(--nl-text)]">
                      {v.title}
                    </h3>
                    <div
                      className="mt-3 h-px w-12"
                      style={{
                        background: `linear-gradient(to left, transparent, ${v.accent}80)`,
                      }}
                    />
                    <p className="mt-5 text-base leading-relaxed text-[var(--nl-text-mute)] md:text-base">
                      {v.body}
                    </p>

                    <div className="mt-auto pt-7">
                      <span
                        className="inline-flex items-center gap-1.5 text-base font-medium"
                        style={{ color: v.accent }}
                      >
                        <LiaCheckSolid size={14} />
                        وعد ملتزمين بيه
                      </span>
                    </div>
                  </div>
                </GlowCard>
              </RevealItem>
            ))}
          </div>

          <RevealOnScroll delay={0.2} className="mt-16 text-center">
            <MagneticButton
              variant="primary"
              className="!px-8 !py-4 !text-base"
              onClick={() => (window.location.href = '/signup')}
            >
              ابدأ تجربتك معانا
              <LiaArrowLeftSolid />
            </MagneticButton>
          </RevealOnScroll>
        </div>
      </section>

      <CtaFooter />
    </main>
  );
}
