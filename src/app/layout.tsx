import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orderaa Dashboard',
  description: 'Orderaa management system',
  generator: 'v0.app',
  icons: {
    icon: '/images/favicon.png',
  },
};

// Load Beiruti (Arabic + Latin)
const beiruti = localFont({
  src: '../assets/fonts/Beiruti.ttf',
  variable: '--font-beiruti',
  display: 'swap',
});

// Installing Zustand
// Cleaning the Auth Folder structure and code

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      {/* font-sans will map to Beiruti via Tailwind config below */}
      <body className={`${beiruti.variable} font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
