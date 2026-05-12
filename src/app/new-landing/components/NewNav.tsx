'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import { LiaTimesSolid, LiaBarsSolid } from 'react-icons/lia';
import OrderaaLogo from '@/assets/icons/Orderaa.svg';
import { copy } from '../content/copy';
import { MagneticButton } from './primitives/MagneticButton';

export function NewNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [activeHref, setActiveHref] = useState<string>('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = copy.nav.links.map((l) => l.href.replace('#', ''));
    const elements: HTMLElement[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) elements.push(el);
    });
    const heroEl = document.getElementById('hero');
    if (heroEl) elements.push(heroEl);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (!visible) return;
        const id = visible.target.id;
        setActiveHref(id === 'hero' ? '' : `#${id}`);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'py-2' : 'py-4',
      )}
    >
      <div
        className={clsx(
          'mx-auto flex max-w-7xl items-center justify-between rounded-full border px-5 py-2.5 transition-all duration-500',
          scrolled
            ? 'border-white/10 bg-[#0A0E1E]/70 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]'
            : 'border-transparent bg-transparent',
        )}
      >
        <Link
          href="/new-landing"
          aria-label={copy.brand.name}
          className="flex shrink-0 items-center text-[var(--nl-text)]"
        >
          <Image
            src={OrderaaLogo}
            alt={copy.brand.name}
            priority
            className="h-10 w-auto md:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {copy.nav.links.map((l) => {
            const isActive = activeHref === l.href;
            return (
              <a
                key={l.href}
                href={l.href}
                className={clsx(
                  'group relative rounded-full px-4 py-2 text-base font-medium transition-colors',
                  isActive
                    ? 'text-[var(--nl-text)]'
                    : 'text-[var(--nl-text-mute)] hover:text-[var(--nl-text)]',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-bg"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.06] ring-1 ring-white/10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                {l.label}
                <span
                  className={clsx(
                    'absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-l from-transparent via-[#7B2CFF] to-transparent transition-transform duration-300',
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )}
                />
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/signin"
            className="rounded-full px-4 py-2 text-base font-medium text-[var(--nl-text-mute)] transition-colors hover:text-[var(--nl-text)]"
          >
            {copy.nav.signin}
          </Link>
          <MagneticButton
            variant="primary"
            onClick={() => (window.location.href = '/signup')}
            className="!px-6 !py-3 !text-base"
          >
            {copy.nav.cta}
          </MagneticButton>
        </div>

        <button
          aria-label="القائمة"
          onClick={() => setMobile((m) => !m)}
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--nl-text)] md:hidden"
        >
          {mobile ? <LiaTimesSolid size={20} /> : <LiaBarsSolid size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-2 max-w-7xl rounded-3xl border border-white/10 bg-[#0A0E1E]/95 p-4 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {copy.nav.links.map((l) => {
                const isActive = activeHref === l.href;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobile(false)}
                    className={clsx(
                      'rounded-2xl px-4 py-3.5 text-lg font-medium transition-colors',
                      isActive
                        ? 'bg-gradient-to-l from-[#7B2CFF]/20 to-transparent text-[var(--nl-text)] ring-1 ring-[#7B2CFF]/30'
                        : 'text-[var(--nl-text)] hover:bg-white/[0.04]',
                    )}
                  >
                    {l.label}
                  </a>
                );
              })}
              <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-3">
                <Link
                  href="/signin"
                  className="flex-1 rounded-full border border-white/10 px-4 py-3 text-center text-base font-medium text-[var(--nl-text)]"
                >
                  {copy.nav.signin}
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 rounded-full bg-gradient-to-l from-[#7B2CFF] to-[#3A0CA3] px-4 py-3 text-center text-base font-semibold text-white"
                >
                  {copy.nav.cta}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
