import { notFound } from 'next/navigation';
import { ANALYTICS_PAGE_ENABLED } from '@/constants/featureFlags';

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!ANALYTICS_PAGE_ENABLED) notFound();
  return children;
}
