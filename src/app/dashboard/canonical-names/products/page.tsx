import CanonicalDomainPage from '../components/CanonicalDomainPage';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';

export default function ProductsPage() {
  return <CanonicalDomainPage domain={CANONICAL_NAME_DOMAINS.PRODUCT} />;
}
