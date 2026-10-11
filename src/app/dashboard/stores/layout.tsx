import { notFound } from 'next/navigation';
import { STORES_PAGE_ENABLED } from '@/constants/featureFlags';

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!STORES_PAGE_ENABLED) notFound();
  return children;
}
