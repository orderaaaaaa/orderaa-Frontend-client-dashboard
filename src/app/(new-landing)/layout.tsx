import type { Metadata } from 'next';
import './new-landing.css';
import { WhatsAppFloat } from './components/WhatsAppFloat';

export const metadata: Metadata = {
  title: 'Orderaa — نظام تشغيل التجارة الإلكترونية',
  description:
    'منظومة موحّدة لإدارة الأوردرات والكول سنتر والتغليف والشحن والمخزون. ارفع نسبة التسليم من 40٪ لـ 70٪+ مع Orderaa.',
};

export default function NewLandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="nl-root">
      {children}
      <WhatsAppFloat />
    </div>
  );
}
