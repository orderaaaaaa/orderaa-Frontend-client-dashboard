import { notFound } from 'next/navigation';
import { LEADS_PAGE_ENABLED } from '@/constants/featureFlags';

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!LEADS_PAGE_ENABLED) notFound();
  return children;
}
