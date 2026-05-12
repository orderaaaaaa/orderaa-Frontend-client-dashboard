'use client';

import Link from 'next/link';
import {
  LiaArrowLeftSolid,
  LiaPlaySolid,
  LiaWhatsapp,
  LiaFacebookF,
  LiaLinkedinIn,
  LiaInstagram,
} from 'react-icons/lia';
import { AuroraBackground } from './AuroraBackground';
import { MagneticButton } from './primitives/MagneticButton';
import { RevealOnScroll } from './primitives/RevealOnScroll';
import { copy } from '../content/copy';

const socials = [
  { Icon: LiaWhatsapp, href: '#' },
  { Icon: LiaFacebookF, href: '#' },
  { Icon: LiaLinkedinIn, href: '#' },
  { Icon: LiaInstagram, href: '#' },
];

export function CtaFooter() {
  return (
    <footer className="relative overflow-hidden">
      <section className="relative overflow-hidden py-28 md:py-36">
        <AuroraBackground variant="cta" />
        <div className="relative z-10 mx-auto max-w-5xl px-5 text-center">
          <RevealOnScroll>
            <h2 className="text-4xl font-bold leading-tight text-[var(--nl-text)] md:text-6xl">
              {copy.ctaFooter.headline}
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--nl-text-mute)] md:text-lg">
              {copy.ctaFooter.sub}
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticButton variant="primary" className="!px-9 !py-4 !text-lg">
                {copy.ctaFooter.ctaPrimary}
                <LiaArrowLeftSolid />
              </MagneticButton>
              <MagneticButton variant="outline" strength={8} className="!px-7 !py-4">
                <LiaPlaySolid />
                {copy.ctaFooter.ctaSecondary}
              </MagneticButton>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <div className="relative border-t border-white/[0.06] bg-[#040711] py-14">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#7B2CFF] to-[#3A0CA3] text-white shadow-[0_4px_20px_-2px_rgba(123,44,255,0.6)]">
                  <span className="text-base tracking-tight">O</span>
                </span>
                <span className="text-xl tracking-tight text-[var(--nl-text)]">
                  {copy.brand.name}
                </span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--nl-text-mute)]">
                {copy.brand.tagline} — منظومة موحّدة لإدارة الأوردرات والكول سنتر والشحن والمخزون في مكان واحد.
              </p>
              <div className="mt-5 flex items-center gap-2">
                {socials.map(({ Icon, href }, i) => (
                  <Link
                    key={i}
                    href={href}
                    aria-label="social"
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--nl-text-mute)] transition-colors hover:border-[#7B2CFF]/40 hover:text-[var(--nl-text)]"
                  >
                    <Icon size={16} />
                  </Link>
                ))}
              </div>
            </div>

            {copy.ctaFooter.footer.columns.map((c) => (
              <div key={c.title}>
                <h4 className="text-sm font-semibold text-[var(--nl-text)]">{c.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-[var(--nl-text-mute)] transition-colors hover:text-[var(--nl-text)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-[var(--nl-text-mute)] md:flex-row">
            <span>{copy.ctaFooter.footer.copyright}</span>
            <span className="font-mono">Made in Egypt</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
