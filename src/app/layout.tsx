import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// TODO: Check the sideImage issue. ✔️
// TODO: Fix the publick folder routing issue.

// The starting width is 430 for the screens

export const metadata: Metadata = {
  title: 'Orderaa Dashboard',
  description: 'Orderaa management system',
  generator: 'v0.app',
};

// Load Cairo (Arabic + Latin)
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      {/* font-sans will map to Cairo via Tailwind config below */}
      <body className={`${cairo.variable} font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
