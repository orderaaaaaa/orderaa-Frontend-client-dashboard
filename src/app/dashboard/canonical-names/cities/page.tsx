import CanonicalNamesWorkspace from '../components/CanonicalNamesWorkspace';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';

export default function CitiesPage() {
  return (
    <CanonicalNamesWorkspace
      domain={CANONICAL_NAME_DOMAINS.CITY}
      title="المدن"
      scopeSelector="governorate"
    />
  );
}
