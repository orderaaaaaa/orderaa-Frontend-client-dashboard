'use client';

import React, { useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/state-panels';
import { useI18n } from '@/i18n/I18nProvider';
import { useGetCustomers } from '@/app/dashboard/customers/hooks/useGetCustomers';
import type { Customer } from '@/app/dashboard/customers/types/customer';
import { useDebounce } from '@/utils/debounce';

type CustomerPickerProps = {
  id?: string;
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  error?: string;
};

const RESULT_LIMIT = 8;

export default function CustomerPicker({
  id = 'customer-picker',
  value,
  onChange,
  error,
}: CustomerPickerProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 300);
  const customersQuery = useGetCustomers(
    { search: debouncedQuery, limit: RESULT_LIMIT },
    { enabled: value === null },
  );

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-foreground">
            {value.name}
          </span>
          <span dir="ltr" className="text-start text-sm text-muted-foreground">
            {value.phoneNumbers[0] ?? ''}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setQuery('');
          }}
          className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-muted"
        >
          <X className="size-4" aria-hidden="true" />
          {t('customerReturn.customer.change')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" data-field-error={id}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 z-(--z-raised) size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        {customersQuery.isFetching && !customersQuery.isLoading && (
          <Loader2
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <Input
          id={id}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('customerReturn.customer.placeholder')}
          className="w-full"
          inputClassName="bg-background ps-9"
          error={error}
        />
      </div>

      {customersQuery.isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 bg-muted border border-border/60" />
          <Skeleton className="h-12 bg-muted border border-border/60" />
        </div>
      )}

      {customersQuery.isError && (
        <ErrorState
          error={customersQuery.error}
          fallback={t('customerReturn.customer.loadError')}
          onRetry={() => void customersQuery.refetch()}
        />
      )}

      {customersQuery.data && customersQuery.data.data.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {t('customerReturn.customer.empty')}
        </p>
      )}

      {customersQuery.data && customersQuery.data.data.length > 0 && (
        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-lg border border-border bg-card p-1">
          {customersQuery.data.data.map((customer) => (
            <li key={customer.id}>
              <button
                type="button"
                onClick={() => onChange(customer)}
                className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-start hover:bg-muted"
              >
                <span className="truncate font-medium text-foreground">
                  {customer.name}
                </span>
                <span
                  dir="ltr"
                  className="shrink-0 text-sm text-muted-foreground"
                >
                  {customer.phoneNumbers[0] ?? ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
