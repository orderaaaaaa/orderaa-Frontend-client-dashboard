import CanonicalNamesWorkspace from '../components/CanonicalNamesWorkspace';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';

export default function AttributeOptionsPage() {
  return (
    <CanonicalNamesWorkspace
      domain={CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION}
      title="قيم الخصائص"
      scopeSelector="none"
    />
  );
}
