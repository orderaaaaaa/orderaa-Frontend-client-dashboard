import CanonicalNamesWorkspace from '../components/CanonicalNamesWorkspace';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';

export default function GovernoratesPage() {
  return (
    <CanonicalNamesWorkspace
      domain={CANONICAL_NAME_DOMAINS.GOVERNORATE}
      title="المحافظات"
      scopeSelector="none"
    />
  );
}
