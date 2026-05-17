'use client';

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
          <span className="font-mono text-lg uppercase tracking-[0.3em] text-[#9D4EDD]">
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
            <div className="relative">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className="w-[28%] border-b border-white/[0.06] px-2 py-3 text-right text-base font-medium uppercase tracking-[0.18em] text-[var(--nl-text-mute)] sm:px-4 sm:py-5 sm:text-base sm:tracking-[0.2em]">
                      الميزة
                    </th>
                    {copy.compare.columns.map((c, i) => (
                      <th
                        key={c}
                        className={clsx(
                          'border-b border-white/[0.06] px-2 py-3 text-center text-base font-semibold sm:px-4 sm:py-5 sm:text-lg',
                          tone(i) === 'orderaa'
                            ? 'relative text-[var(--nl-text)]'
                            : 'text-[var(--nl-text-mute)]',
                        )}
                      >
                        {tone(i) === 'orderaa' && (
                          <span className="absolute inset-x-1 inset-y-2 -z-10 rounded-xl bg-gradient-to-b from-[#7B2CFF]/20 via-[#7B2CFF]/10 to-transparent ring-1 ring-[#7B2CFF]/30 sm:inset-x-3 sm:rounded-2xl" />
                        )}
                        <span
                          className={clsx(
                            'break-words',
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
                  {copy.compare.rows.map((row) => (
                    <tr key={row.feature} className="group">
                      <td className="border-b border-white/[0.04] px-2 py-3 text-right text-base font-medium leading-snug text-[var(--nl-text)] break-words transition-colors group-hover:bg-white/[0.03] sm:px-4 sm:py-4 sm:text-base">
                        {row.feature}
                      </td>
                      {row.values.map((v, ci) => (
                        <td
                          key={ci}
                          className={clsx(
                            'border-b border-white/[0.04] px-2 py-3 text-center text-base leading-snug transition-colors break-words sm:px-4 sm:py-4 sm:text-base',
                            tone(ci) === 'orderaa'
                              ? 'relative font-medium text-[var(--nl-text)]'
                              : 'text-[var(--nl-text-mute)]',
                            'group-hover:bg-white/[0.03]',
                          )}
                        >
                          {tone(ci) === 'orderaa' && (
                            <span className="absolute inset-x-1 inset-y-1 -z-10 rounded-lg bg-[#7B2CFF]/[0.06] sm:inset-x-3 sm:rounded-xl" />
                          )}
                          {v}
                        </td>
                      ))}
                    </tr>
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
