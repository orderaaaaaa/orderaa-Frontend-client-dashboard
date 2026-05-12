'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { RevealOnScroll } from './primitives/RevealOnScroll';
import { copy } from '../content/copy';

const tone = (idx: number) => (idx === 0 ? 'orderaa' : 'rival');

export function CompetitorMatrix() {
  return (
    <section id="compare" className="relative overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-5">
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#9D4EDD]">
            {copy.compare.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-[var(--nl-text)] md:text-5xl">
            {copy.compare.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
            {copy.compare.sub}
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} className="mt-14">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0A0E1E] to-[#11162B] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
            <div className="relative overflow-x-auto overflow-y-hidden">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr>
                    <th className="sticky right-0 z-10 w-[34%] border-b border-white/[0.06] bg-[#0A0E1E] px-5 py-5 text-right text-xs font-medium uppercase tracking-[0.2em] text-[var(--nl-text-mute)]">
                      الميزة
                    </th>
                    {copy.compare.columns.map((c, i) => (
                      <th
                        key={c}
                        className={clsx(
                          'border-b border-white/[0.06] px-5 py-5 text-center text-sm font-semibold',
                          tone(i) === 'orderaa'
                            ? 'relative text-[var(--nl-text)]'
                            : 'text-[var(--nl-text-mute)]',
                        )}
                      >
                        {tone(i) === 'orderaa' && (
                          <span className="absolute inset-x-3 inset-y-2 -z-10 rounded-2xl bg-gradient-to-b from-[#7B2CFF]/20 via-[#7B2CFF]/10 to-transparent ring-1 ring-[#7B2CFF]/30" />
                        )}
                        <span
                          className={clsx(
                            tone(i) === 'orderaa' &&
                              'bg-gradient-to-l from-[#9D4EDD] to-[#7B2CFF] bg-clip-text text-transparent',
                          )}
                        >
                          {c}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {copy.compare.rows.map((row, ri) => (
                    <motion.tr
                      key={row.feature}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.4, delay: ri * 0.04 }}
                      className="group"
                    >
                      <td className="sticky right-0 z-10 border-b border-white/[0.04] bg-[#0A0E1E] px-5 py-4 text-right text-sm font-medium text-[var(--nl-text)] group-hover:bg-white/[0.02]">
                        {row.feature}
                      </td>
                      {row.values.map((v, ci) => (
                        <td
                          key={ci}
                          className={clsx(
                            'border-b border-white/[0.04] px-5 py-4 text-center text-sm transition-colors',
                            tone(ci) === 'orderaa'
                              ? 'relative font-medium text-[var(--nl-text)]'
                              : 'text-[var(--nl-text-mute)]',
                            'group-hover:bg-white/[0.015]',
                          )}
                        >
                          {tone(ci) === 'orderaa' && (
                            <span className="absolute inset-x-3 inset-y-1 -z-10 rounded-xl bg-[#7B2CFF]/[0.06]" />
                          )}
                          {v}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-white/[0.06] bg-gradient-to-l from-[#7B2CFF]/[0.08] via-transparent to-transparent px-6 py-5 text-center">
              <p className="text-base font-semibold text-[var(--nl-text)] md:text-lg">
                <span className="text-[var(--nl-text-mute)]">Shopify للبيع،</span>{' '}
                <span className="bg-gradient-to-l from-[#9D4EDD] to-[#7B2CFF] bg-clip-text text-transparent">
                  Orderaa للتشغيل
                </span>
                .
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
