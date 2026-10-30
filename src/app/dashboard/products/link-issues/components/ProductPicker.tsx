'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/state-panels';
import { useI18n } from '@/i18n/I18nProvider';
import { useDebounce } from '@/utils/debounce';
import { useGetProducts } from '../../hooks/useProduct';
import { ItemSelect, type ItemSelectOption } from './ItemSelect';

const PRODUCT_SEARCH_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface ProductPickerProps {
  canRead: boolean;
  selected: ItemSelectOption | null;
  onSelect: (productId: number) => void;
}

export function ProductPicker({ canRead, selected, onSelect }: ProductPickerProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
  const hasSearch = debouncedSearch.length > 0;
  const resultsQuery = useGetProducts(
    { page: 1, limit: PRODUCT_SEARCH_LIMIT, search: debouncedSearch },
    canRead && hasSearch,
  );

  if (!canRead) {
    return <EmptyState title={t('linkIssues.unlinked.productReadRequired')} />;
  }

  const results = (resultsQuery.data?.data ?? []).map((product) => ({
    id: product.id,
    label: product.name,
  }));
  const options =
    selected && !results.some((result) => result.id === selected.id)
      ? [selected, ...results]
      : results;

  let placeholder = t('linkIssues.unlinked.productSearchHint');
  if (hasSearch) {
    placeholder = resultsQuery.isFetching
      ? t('linkIssues.unlinked.searching')
      : t('linkIssues.unlinked.pickProduct');
  }

  return (
    <div className="space-y-2">
      <Input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t('linkIssues.unlinked.productSearch')}
        aria-label={t('linkIssues.unlinked.productSearch')}
      />
      <ItemSelect
        value={selected?.id ?? null}
        options={options}
        placeholder={placeholder}
        ariaLabel={t('linkIssues.unlinked.pickProduct')}
        disabled={!hasSearch && selected === null}
        onChange={onSelect}
      />
    </div>
  );
}
