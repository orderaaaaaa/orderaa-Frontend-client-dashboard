import { missingAttributesMessage } from '@/utils/variantSelection';

interface MissingAttributesHintProps {
  missing: readonly string[];
  productName?: string;
  className?: string;
}

export function MissingAttributesHint({
  missing,
  productName,
  className = '',
}: MissingAttributesHintProps) {
  if (missing.length === 0) return null;
  const message = missingAttributesMessage(missing);
  return (
    <p role="alert" className={`text-red-600 text-sm ${className}`}>
      {productName ? `${productName}: ${message}` : message}
    </p>
  );
}
