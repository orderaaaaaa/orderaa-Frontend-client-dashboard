import { notFound } from 'next/navigation';
import { DEV_PREVIEW_PAGES_ENABLED } from '@/constants/featureFlags';

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!DEV_PREVIEW_PAGES_ENABLED) notFound();
  return children;
}
