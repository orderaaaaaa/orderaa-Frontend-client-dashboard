'use client';

import clsx from 'clsx';

type AuroraBackgroundProps = {
  className?: string;
  variant?: 'hero' | 'subtle' | 'cta';
};

export function AuroraBackground({ className, variant = 'hero' }: AuroraBackgroundProps) {
  const orbs =
    variant === 'cta'
      ? [
          { size: 620, color: '#7B2CFF', x: '15%', y: '20%', dur: 22 },
          { size: 540, color: '#3A0CA3', x: '75%', y: '70%', dur: 28 },
        ]
      : variant === 'subtle'
        ? [
            { size: 480, color: '#5d24e1', x: '85%', y: '10%', dur: 30 },
            { size: 380, color: '#240046', x: '10%', y: '80%', dur: 36 },
          ]
        : [
            { size: 700, color: '#7B2CFF', x: '10%', y: '15%', dur: 18 },
            { size: 600, color: '#3A0CA3', x: '80%', y: '20%', dur: 22 },
            { size: 520, color: '#9D4EDD', x: '40%', y: '75%', dur: 26 },
            { size: 420, color: '#240046', x: '65%', y: '85%', dur: 30 },
          ];

  return (
    <div
      aria-hidden
      className={clsx('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(91,32,168,0.18),transparent_60%)]" />

      {orbs.map((o, i) => (
        <div
          key={i}
          className="nl-aurora-orb absolute rounded-full mix-blend-screen"
          style={{
            width: o.size,
            height: o.size,
            left: o.x,
            top: o.y,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${o.color}AA 0%, ${o.color}33 35%, transparent 70%)`,
            filter: 'blur(60px)',
            animationDuration: `${o.dur}s`,
            animationDelay: `${-i * 2}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#040711_92%)]" />

      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
        }}
      />
    </div>
  );
}
