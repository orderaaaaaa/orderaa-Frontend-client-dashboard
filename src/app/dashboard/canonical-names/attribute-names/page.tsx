import CanonicalNamesWorkspace from '../components/CanonicalNamesWorkspace';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';

export default function AttributeNamesPage() {
  return (
    <CanonicalNamesWorkspace
      domain={CANONICAL_NAME_DOMAINS.ATTRIBUTE_NAME}
      title="أسماء الخصائص"
      scopeSelector="none"
    />
  );
}
