'use client';

import { motion } from 'framer-motion';
import {
  LiaTruckLoadingSolid,
  LiaChartLineSolid,
  LiaBoxOpenSolid,
  LiaUsersSolid,
  LiaExclamationCircleSolid,
} from 'react-icons/lia';
import { RevealOnScroll } from './primitives/RevealOnScroll';
import { copy } from '../content/copy';

const clusterIcons = [
  LiaTruckLoadingSolid,
  LiaChartLineSolid,
  LiaBoxOpenSolid,
  LiaUsersSolid,
  LiaExclamationCircleSolid,
];

export function ProblemMatrix() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/2 top-1/3 h-[480px] w-[480px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#EF4444]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5">
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-sm uppercase tracking-[0.3em] text-[#EF4444]/80">
            {copy.problem.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-[var(--nl-text)] md:text-5xl">
            {copy.problem.headline}{' '}
            <span className="relative inline-block font-mono">
              <span className="relative bg-gradient-to-l from-[#FF6B6B] to-[#EF4444] bg-clip-text text-transparent">
                {copy.problem.headlineStat}
              </span>
              <span
                aria-hidden
                className="absolute -inset-x-2 -inset-y-1 -z-10 rounded-lg bg-[#EF4444]/20 blur-xl"
              />
            </span>{' '}
            {copy.problem.headlineTail}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
            {copy.problem.sub}
          </p>
        </RevealOnScroll>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {copy.problem.clusters.map((c, i) => {
            const Icon = clusterIcons[i];
            const isWide = i === 4;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1, margin: '0px 0px 200px 0px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-7 transition-all hover:-translate-y-1 hover:border-[#EF4444]/30 md:p-8 ${
                  isWide ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#EF4444]/10 blur-3xl opacity-50 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#EF4444]/25 bg-[#EF4444]/[0.06] text-[#FF6B6B] shadow-[0_4px_24px_-6px_rgba(239,68,68,0.35)]">
                    <Icon size={26} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold leading-snug text-[var(--nl-text)] md:text-2xl">
                    {c.title}
                  </h3>
                  <div className="mt-4 h-px w-12 bg-gradient-to-l from-transparent to-[#EF4444]/50" />
                  <ul className="mt-5 space-y-3">
                    {c.items.map((it) => (
                      <li
                        key={it}
                        className="flex items-start gap-3 text-[15px] leading-relaxed text-[var(--nl-text-mute)] md:text-base"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EF4444] ring-2 ring-[#EF4444]/20" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
