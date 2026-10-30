import CanonicalDomainPage from '../components/CanonicalDomainPage';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';

export default function AttributeOptionsPage() {
  return <CanonicalDomainPage domain={CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION} />;
}
