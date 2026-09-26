import CanonicalNamesWorkspace from '../components/CanonicalNamesWorkspace';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';

interface GovernoratesPageProps {
  searchParams?: { search?: string | string[] };
}

export default function GovernoratesPage({ searchParams }: GovernoratesPageProps) {
  const search = searchParams?.search;
  const initialSearch = Array.isArray(search) ? search[0] : search;

  return (
    <CanonicalNamesWorkspace
      key={initialSearch ?? ''}
      domain={CANONICAL_NAME_DOMAINS.GOVERNORATE}
      title="المحافظات"
      scopeSelector="none"
      initialSearch={initialSearch}
    />
  );
}
