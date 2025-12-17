'use client';
import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'base';

export default function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('base');

  useEffect(() => {
    const sm = window.matchMedia('(min-width: 640px)');
    const md = window.matchMedia('(min-width: 768px)');
    const lg = window.matchMedia('(min-width: 1024px)');
    const xl = window.matchMedia('(min-width: 1280px)');
    const xxl = window.matchMedia('(min-width: 1536px)');

    const checkBreakpoint = () => {
      if (xxl.matches) setBreakpoint('2xl');
      else if (xl.matches) setBreakpoint('xl');
      else if (lg.matches) setBreakpoint('lg');
      else if (md.matches) setBreakpoint('md');
      else if (sm.matches) setBreakpoint('sm');
      else setBreakpoint('base');
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return breakpoint;
}
