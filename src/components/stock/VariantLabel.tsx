import { cn } from '@/lib/utils';
import {
  variantDisplayLabel,
  type VariantDisplayItem,
} from '@/lib/variantOptionLabel';

interface VariantLabelProps {
  productName: string;
  sku: string | null;
  options: VariantDisplayItem[];
  optionsLabel?: string;
  size?: 'sm' | 'md';
}

export function VariantLabel({
  productName,
  sku,
  options,
  optionsLabel: serverOptionsLabel,
  size = 'md',
}: VariantLabelProps) {
  const optionsLabel = serverOptionsLabel || variantDisplayLabel(options);
  const isSmall = size === 'sm';

  return (
    <div className="min-w-0">
      <p
        className={cn(
          'break-words font-medium text-foreground',
          isSmall ? 'text-sm' : 'text-base'
        )}
      >
        {productName}
      </p>
      {optionsLabel ? (
        <p
          className={cn(
            'break-words text-muted-foreground',
            isSmall ? 'text-xs' : 'text-sm'
          )}
        >
          {optionsLabel}
        </p>
      ) : sku ? (
        <p
          dir="ltr"
          className={cn(
            'break-all text-start font-mono tabular-nums text-muted-foreground',
            isSmall ? 'text-xs' : 'text-sm'
          )}
        >
          {sku}
        </p>
      ) : null}
    </div>
  );
}
