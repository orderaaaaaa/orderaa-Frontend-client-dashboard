'use client';

import {
  LiaShoppingBagSolid,
  LiaBullhornSolid,
  LiaUserCheckSolid,
  LiaTruckSolid,
  LiaConciergeBellSolid,
} from 'react-icons/lia';
import { RevealOnScroll } from './primitives/RevealOnScroll';
import { RevealItem } from './primitives/RevealItem';
import { copy } from '../content/copy';

const pillarIcons = [
  LiaShoppingBagSolid,
  LiaBullhornSolid,
  LiaUserCheckSolid,
  LiaTruckSolid,
  LiaConciergeBellSolid,
];

export function EcosystemDiagram() {
  return (
    <section
      id="vision"
      className="relative overflow-hidden bg-gradient-to-b from-[#040711] via-[#0A0E1E] to-[#040711] py-28 md:py-36"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(123,44,255,0.18)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5">
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-lg uppercase tracking-[0.3em] text-[#9D4EDD]">
            {copy.vision.eyebrow}
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-tight text-[var(--nl-text)] md:text-5xl">
            {copy.vision.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
            {copy.vision.sub}
          </p>
        </RevealOnScroll>

        <div className="relative mt-16">
          <div className="mx-auto flex max-w-md justify-center">
            <div className="relative grid h-32 w-32 place-items-center rounded-3xl border border-[#7B2CFF]/40 bg-gradient-to-br from-[#1B0F3D] to-[#0A0E1E] shadow-[0_0_60px_-10px_rgba(123,44,255,0.6)] nl-anim-scale-in">
              <span
                aria-hidden
                className="absolute inset-0 rounded-3xl bg-[#7B2CFF]/20 blur-xl animate-pulse"
              />
              <span className="relative text-2xl font-bold text-[var(--nl-text)]">
                Orderaa
              </span>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {copy.vision.pillars.map((p, i) => {
              const Icon = pillarIcons[i];
              return (
                <RevealItem
                  key={p.title}
                  delay={i * 0.08}
                  className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-sm transition-colors hover:border-[#7B2CFF]/40"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#7B2CFF]/25 to-[#3A0CA3]/15 text-[#C8A6FF] ring-1 ring-[#7B2CFF]/30">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--nl-text)]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[var(--nl-text-mute)]">
                    {p.body}
                  </p>
                  <span className="absolute inset-x-5 bottom-0 h-px scale-x-0 bg-gradient-to-l from-transparent via-[#7B2CFF] to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                </RevealItem>
              );
            })}
          </div>

          <RevealOnScroll delay={0.2} className="mt-14 text-center">
            <p className="mx-auto max-w-3xl rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-5 text-base leading-relaxed text-[var(--nl-text)] backdrop-blur-sm md:text-lg">
              {copy.vision.targetLine}
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
