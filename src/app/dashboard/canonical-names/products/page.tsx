import CanonicalNamesWorkspace from '../components/CanonicalNamesWorkspace';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';

export default function ProductNamesPage() {
  return (
    <CanonicalNamesWorkspace
      domain={CANONICAL_NAME_DOMAINS.PRODUCT}
      title="أسماء المنتجات"
      scopeSelector="none"
    />
  );
}
