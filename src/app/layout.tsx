import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import 'react-day-picker/dist/style.css';
import './globals.css';
import ToastifyProvider from '@/components/ToastifyProvider';
import QueryProvider from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Orderaa Dashboard',
  description: 'Orderaa management system',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.png',
  },
};

// Load Beiruti (Arabic + Latin)
const beiruti = localFont({
  src: '../assets/fonts/Beiruti.ttf',
  variable: '--font-beiruti',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${beiruti.variable} font-sans`}>
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
        <ToastifyProvider />
      </body>
    </html>
  );
}
