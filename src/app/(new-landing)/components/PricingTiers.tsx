'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { LiaCheckSolid, LiaStarSolid } from 'react-icons/lia';
import { RevealOnScroll } from './primitives/RevealOnScroll';
import { MagneticButton } from './primitives/MagneticButton';
import { copy } from '../content/copy';

export function PricingTiers() {
  return (
    <section id="pricing" className="relative overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7B2CFF]/8 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5">
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-lg uppercase tracking-[0.3em] text-[#9D4EDD]">
            {copy.pricing.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-[var(--nl-text)] md:text-5xl">
            {copy.pricing.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
            {copy.pricing.sub}
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {copy.pricing.tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.06 }}
              className={clsx(
                'relative flex flex-col',
                t.popular && 'lg:scale-105 lg:-translate-y-2 lg:z-10',
              )}
            >
              {t.popular && <PopularBorder />}
              <div
                className={clsx(
                  'relative flex h-full flex-col overflow-hidden rounded-3xl p-6 backdrop-blur-sm',
                  t.popular
                    ? 'border border-[#7B2CFF]/30 bg-gradient-to-b from-[#1B0F3D] to-[#0A0E1E]'
                    : 'border border-white/[0.07] bg-white/[0.025]',
                )}
              >
                {t.popular && (
                  <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-[#9D4EDD] to-[#7B2CFF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_4px_20px_-2px_rgba(123,44,255,0.5)]">
                    <LiaStarSolid />
                    الأكثر طلباً
                  </div>
                )}

                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-medium text-[var(--nl-text-mute)]">{t.name}</span>
                </div>
                <div className="mt-1 text-xs text-[var(--nl-text-mute)]">{t.orders}</div>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-bold text-[var(--nl-text)] md:text-5xl">
                    {t.price === 0 ? 'مجاناً' : t.price.toLocaleString('en-US')}
                  </span>
                  {t.price !== 0 && (
                    <span className="text-xs text-[var(--nl-text-mute)]">
                      {copy.pricing.currency}
                    </span>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {t.perks.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--nl-text-mute)]"
                    >
                      <span
                        className={clsx(
                          'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full',
                          t.popular ? 'bg-[#7B2CFF]/30 text-[#C8A6FF]' : 'bg-white/[0.06] text-[var(--nl-text-mute)]',
                        )}
                      >
                        <LiaCheckSolid size={11} />
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  <MagneticButton
                    variant={t.popular ? 'primary' : 'outline'}
                    fullWidth
                    strength={10}
                    className="!py-3 !text-sm"
                  >
                    {t.cta}
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularBorder() {
  return (
    <span
      aria-hidden
      className="absolute -inset-px rounded-3xl"
      style={{
        background:
          'conic-gradient(from 0deg, #9D4EDD 0%, #7B2CFF 25%, #3A0CA3 50%, #7B2CFF 75%, #9D4EDD 100%)',
        animation: 'spin 10s linear infinite',
        filter: 'blur(0px)',
      }}
    />
  );
}
