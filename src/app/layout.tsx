import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import 'react-day-picker/dist/style.css';
import './globals.css';
import ToastifyProvider from '@/components/ToastifyProvider';
import QueryProvider from '@/providers/QueryProvider';
import { I18nProvider } from '@/i18n/I18nProvider';

export const metadata: Metadata = {
  title: 'Orderaa Dashboard',
  description: 'Orderaa management system',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
    // Arabic stays the server-rendered default; `I18nProvider` rewrites both
    // attributes on the client once it has read the stored preference. Hardcoded
    // here rather than derived, because a server component cannot see it.
    <html lang="ar" dir="rtl">
      <body className={`${beiruti.variable} font-sans m-0`}>
        <I18nProvider>
          <QueryProvider>{children}</QueryProvider>
        </I18nProvider>
        <Analytics />
        <ToastifyProvider />
      </body>
    </html>
  );
}
