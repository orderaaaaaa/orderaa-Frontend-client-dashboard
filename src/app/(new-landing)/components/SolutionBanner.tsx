'use client';

import { RevealOnScroll } from './primitives/RevealOnScroll';
import { copy } from '../content/copy';

export function SolutionBanner() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.05] bg-gradient-to-b from-[#0A0E1E] via-[#11162B] to-[#0A0E1E] py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-l from-[#7B2CFF]/15 via-[#3A0CA3]/10 to-transparent blur-2xl nl-anim-slide-in-x-rev"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-[#9D4EDD]/15 via-[#3A0CA3]/10 to-transparent blur-2xl nl-anim-slide-in-x"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 text-center">
        <RevealOnScroll>
          <span className="font-mono text-lg uppercase tracking-[0.3em] text-[#9D4EDD]">
            {copy.solution.eyebrow}
          </span>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <h2 className="mt-5 text-4xl font-bold leading-tight text-[var(--nl-text)] md:text-6xl">
            {copy.solution.headlinePre}{' '}
            <span className="bg-gradient-to-l from-[#9D4EDD] via-[#7B2CFF] to-[#5d24e1] bg-clip-text text-transparent">
              {copy.solution.headlineBrand}
            </span>{' '}
            {copy.solution.headlinePost}
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
            {copy.solution.sub}
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.3}>
          <div className="mt-9 flex flex-wrap justify-center gap-2">
            {copy.solution.pills.map((p) => (
              <span
                key={p}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-[var(--nl-text)] backdrop-blur-sm"
              >
                {p}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
