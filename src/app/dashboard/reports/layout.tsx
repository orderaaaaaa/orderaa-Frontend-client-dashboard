import { notFound } from 'next/navigation';
import { REPORTS_PAGE_ENABLED } from '@/constants/featureFlags';

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!REPORTS_PAGE_ENABLED) notFound();
  return children;
}
