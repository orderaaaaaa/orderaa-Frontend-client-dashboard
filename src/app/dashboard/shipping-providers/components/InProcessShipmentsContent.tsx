'use client';

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, CircleDollarSign, ClipboardList, Info, PackageSearch, Search, X } from 'lucide-react';
import { Can } from '@/components/Can';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import CopyButton from '@/components/ui/copy-button';
import Input from '@/components/ui/Input';
import PaginationFooter from '@/components/ui/pagination-footer';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { SummaryStatCard, SummaryStatCardSkeleton } from '@/components/ui/summary-stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useShippingCompanies from '@/hooks/useShippingCompanies';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { PERMISSIONS } from '@/lib/permissions';
import { integrationLogoOf } from '@/lib/shippingCompanies';
import { cn } from '@/lib/utils';
import { useGovernoratesQuery, useCitiesQuery } from '@/services/lookups';
import {
  useInProcessShipmentsQuery,
  useReturnedShipmentsQuery,
} from '@/services/shippingProviders';
import { FOLLOWUP_WORK_STATES, type FollowupWorkState } from '@/types/logistics';
import type { ShippingImplementation } from '@/types/shippingCompanies';
import {
  IN_PROCESS_STATUSES,
  type CarrierHeader,
  type InProcessFilters,
  type InProcessStatus,
} from '@/types/shippingProviders';
import { useDebounce } from '@/utils/debounce';
import { FollowupNotesModal } from './FollowupNotesModal';
import { formatNumber } from './formatNumber';
import { OrderActionLogModal } from './OrderActionLogModal';
import { InProcessShipmentsTable, ReturnedShipmentsTable } from './ShipmentsTable';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;
const SKELETON_ROWS = 8;
const NET_COLUMN_INDEX = 9;
const SEARCH_NOTICE_ID = 'in-process-search-notice';
const IN_PROCESS_SKELETON_WIDTHS = [
  'w-16',
  'w-32',
  'w-20',
  'w-24',
  'w-24',
  'w-24',
  'w-32',
  'w-24',
  'w-16',
  'w-16',
  'w-6',
];
const RETURNED_SKELETON_WIDTHS = ['w-16', 'w-32', 'w-20', 'w-24', 'w-32', 'w-16', 'w-6'];
const WORK_STATE_OPTIONS: { value: FollowupWorkState; labelKey: TranslationKey }[] = [
  { value: 'open', labelKey: 'inProcess.workState.open' },
  { value: 'closed', labelKey: 'inProcess.workState.closed' },
  { value: 'all', labelKey: 'inProcess.workState.all' },
];
const EMPTY_STATE_ICON = <PackageSearch className="size-10 text-muted-foreground" aria-hidden="true" />;

type ShipmentView = 'in-process' | 'returned';
type SelectOptions = ComponentProps<typeof SearchableSelect>['options'];

const resolveView = (
  requested: string | null,
  canInProcess: boolean,
  canReturned: boolean,
): ShipmentView => {
  const wanted: ShipmentView = requested === 'returned' ? 'returned' : 'in-process';
  if (wanted === 'returned' ? canReturned : canInProcess) return wanted;
  if (canInProcess) return 'in-process';
  if (canReturned) return 'returned';
  return wanted;
};

const readWorkState = (value: string | null): FollowupWorkState =>
  FOLLOWUP_WORK_STATES.find((state) => state === value) ?? 'open';

const readStatus = (value: string | null): InProcessStatus | undefined =>
  IN_PROCESS_STATUSES.find((status) => status === value);

const readPage = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
};

const buildSearchUrl = (
  pathname: string,
  current: URLSearchParams,
  patch: Record<string, string>,
): string => {
  const next = new URLSearchParams(current.toString());
  Object.entries(patch).forEach(([key, value]) => {
    if (value) next.set(key, value);
    else next.delete(key);
  });
  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
};

interface ViewSwitchProps {
  view: ShipmentView;
  canInProcess: boolean;
  canReturned: boolean;
  onViewChange: (view: ShipmentView) => void;
  restoreFocusRef: { current: boolean };
}

interface ListProps {
  shippingCompanyId: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  viewSwitch: ViewSwitchProps;
}

interface InProcessListProps extends ListProps {
  filters: InProcessFilters;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  controls: ReactNode;
  onOpenNotes: (orderId: number) => void;
  onOpenActionLog: (orderId: number) => void;
}

interface ListHeaderProps {
  view: ShipmentView;
  carrier: CarrierHeader | undefined;
  implementation: ShippingImplementation | undefined;
  isLoading: boolean;
}

function ListHeader({ view, carrier, implementation, isLoading }: ListHeaderProps) {
  const { t } = useI18n();
  const logo = integrationLogoOf(implementation);
  const isReturned = view === 'returned';

  return (
    <div className="flex flex-col gap-2">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/dashboard/shipping-providers">
          <ChevronRight aria-hidden="true" />
          رجوع إلى جهات الشحن
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        {logo && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-surface-subtle p-1.5">
            <Image src={logo} alt="" width={28} height={28} className="object-contain" unoptimized />
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          {isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t(isReturned ? 'inProcess.title.returned' : 'inProcess.title.inProcess')}
            </h1>
          )}
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            carrier && (
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{carrier.name}</span>
                {carrier.phone && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span dir="ltr" className="font-mono">
                      {carrier.phone}
                    </span>
                    <CopyButton
                      value={carrier.phone}
                      label={t('inProcess.carrier.copyPhone')}
                      successMessage="تم نسخ الرقم"
                    />
                  </>
                )}
              </p>
            )
          )}
          <p className="text-sm text-muted-foreground">
            {isReturned
              ? 'طلبات أعادتها جهة الشحن إلينا، ولا تتغير حالتها من هذه الصفحة'
              : 'طلبات لدى جهة الشحن لم تُسلَّم ولم تُرتجع بعد'}
          </p>
        </div>
      </div>
    </div>
  );
}

function ViewTabs({
  view,
  canInProcess,
  canReturned,
  onViewChange,
  restoreFocusRef,
  children,
}: ViewSwitchProps & { children: ReactNode }) {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const inactiveView: ShipmentView = view === 'in-process' ? 'returned' : 'in-process';

  useEffect(() => {
    if (!restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    rootRef.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]')?.focus();
  }, [restoreFocusRef]);

  return (
    <div ref={rootRef}>
      <Tabs
        value={view}
        onValueChange={(next) => onViewChange(next === 'returned' ? 'returned' : 'in-process')}
      >
        <TabsList>
          {canInProcess && (
            <TabsTrigger value="in-process">{t('inProcess.title.inProcess')}</TabsTrigger>
          )}
          {canReturned && <TabsTrigger value="returned">{t('inProcess.title.returned')}</TabsTrigger>}
        </TabsList>
        <TabsContent value={view} className="flex flex-col gap-5">
          {children}
        </TabsContent>
        <TabsContent value={inactiveView} forceMount hidden />
      </Tabs>
    </div>
  );
}

function ResultsFrame({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      {busy && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden rounded-t-xl bg-primary/20"
        >
          <div className="h-full w-full animate-pulse bg-primary motion-reduce:animate-none" />
        </div>
      )}
      <div
        aria-busy={busy}
        className={cn(
          'max-h-[calc(100dvh-16rem)] overflow-auto rounded-xl border bg-card',
          busy && 'opacity-60',
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ListSkeleton({ widths }: { widths: string[] }) {
  return (
    <table className="w-full caption-bottom text-sm" aria-hidden="true">
      <tbody>
        {Array.from({ length: SKELETON_ROWS }, (_, row) => (
          <tr key={row} className="border-b">
            {widths.map((width, column) => (
              <td key={column} className="px-3 py-2.5">
                <Skeleton className={cn('h-4', width)} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ListPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  return (
    <PaginationFooter
      currentPage={page}
      totalPages={totalPages}
      totalItems={total}
      hasNextPage={page < totalPages}
      hasPreviousPage={page > 1}
      onPageChange={onPageChange}
      onPrevious={() => onPageChange(Math.max(1, page - 1))}
      onNext={() => onPageChange(Math.min(totalPages, page + 1))}
      currentPageSize={limit}
      onPageSizeChange={onPageSizeChange}
    />
  );
}

interface InProcessControlsProps {
  status: InProcessStatus | undefined;
  statusOptions: SelectOptions;
  governorate: string;
  governorates: SelectOptions;
  city: string;
  cities: SelectOptions;
  citiesLoading: boolean;
  from: string;
  to: string;
  searchInput: string;
  appliedSearch: string;
  activeCount: number;
  workState: FollowupWorkState;
  onPatch: (patch: Record<string, string>) => void;
  onClearAll: () => void;
  onSearchChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement>;
}

function InProcessControls({
  status,
  statusOptions,
  governorate,
  governorates,
  city,
  cities,
  citiesLoading,
  from,
  to,
  searchInput,
  appliedSearch,
  activeCount,
  workState,
  onPatch,
  onClearAll,
  onSearchChange,
  searchInputRef,
}: InProcessControlsProps) {
  const { t } = useI18n();
  const hasActiveFilters = activeCount > 0;

  return (
    <>
      <Card className="gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle>{t('inProcess.filters.title')}</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary">
                <span aria-hidden="true">{activeCount}</span>
                <span className="sr-only">
                  {t('inProcess.filters.activeCount', { count: activeCount })}
                </span>
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
              <X aria-hidden="true" />
              {t('inProcess.filters.clear')}
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="in-process-search" className="text-xs text-muted-foreground">
            {t('inProcess.filters.search')}
          </label>
          <Input
            ref={searchInputRef}
            id="in-process-search"
            type="text"
            icon={Search}
            placeholder={t('inProcess.filters.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            clearable
            maxLength={100}
            aria-describedby={appliedSearch ? SEARCH_NOTICE_ID : undefined}
          />
        </div>

        {appliedSearch && (
          <Alert
            id={SEARCH_NOTICE_ID}
            role="status"
            className="border-amber-200 bg-amber-50 text-amber-800"
          >
            <Info aria-hidden="true" />
            <p>{t('inProcess.filters.searchNotice')}</p>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="in-process-status" className="text-xs text-muted-foreground">
              {t('inProcess.filters.status')}
            </label>
            <SearchableSelect
              id="in-process-status"
              aria-label={t('inProcess.filters.status')}
              value={status ?? ''}
              onChange={(value) => onPatch({ status: value, page: '' })}
              options={statusOptions}
              placeholder={t('inProcess.filters.allStatuses')}
              clearable
              widthClass="w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="in-process-governorate" className="text-xs text-muted-foreground">
              {t('inProcess.filters.governorate')}
            </label>
            <SearchableSelect
              id="in-process-governorate"
              aria-label={t('inProcess.filters.governorate')}
              value={governorate}
              onChange={(value) => onPatch({ governorate: value, city: '', page: '' })}
              options={governorates}
              placeholder={t('inProcess.filters.allGovernorates')}
              clearable
              widthClass="w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="in-process-city" className="text-xs text-muted-foreground">
              {t('inProcess.filters.city')}
            </label>
            <SearchableSelect
              id="in-process-city"
              aria-label={t('inProcess.filters.city')}
              value={city}
              onChange={(value) => onPatch({ city: value, page: '' })}
              options={cities}
              placeholder={
                governorate
                  ? t('inProcess.filters.allAreas')
                  : t('inProcess.filters.chooseGovernorateFirst')
              }
              disabled={!governorate || citiesLoading}
              clearable
              widthClass="w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="in-process-from" className="text-xs text-muted-foreground">
              {t('inProcess.filters.from')}
            </label>
            <Input
              id="in-process-from"
              type="date"
              value={from}
              onChange={(e) => onPatch({ from: e.target.value, page: '' })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="in-process-to" className="text-xs text-muted-foreground">
              {t('inProcess.filters.to')}
            </label>
            <Input
              id="in-process-to"
              type="date"
              value={to}
              onChange={(e) => onPatch({ to: e.target.value, page: '' })}
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">{t('inProcess.workState.label')}</span>
        <div
          role="radiogroup"
          aria-label={t('inProcess.workState.label')}
          className="inline-flex w-max max-w-full items-center gap-1 overflow-x-auto rounded-full bg-muted p-1"
        >
          {WORK_STATE_OPTIONS.map((option) => {
            const isActive = workState === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="rounded-full px-4 text-xs"
                onClick={() => onPatch({ workState: option.value, page: '' })}
              >
                {t(option.labelKey)}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function InProcessList({
  shippingCompanyId,
  filters,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  viewSwitch,
  hasActiveFilters,
  onClearAll,
  controls,
  onOpenNotes,
  onOpenActionLog,
}: InProcessListProps) {
  const { t } = useI18n();
  const { hasPermission } = usePermissionCheck();
  const { shippingCompanies } = useShippingCompanies();
  const {
    data,
    isLoading,
    isError,
    isFetching,
    isSuccess,
    error,
    refetch,
  } = useInProcessShipmentsQuery(shippingCompanyId, filters);

  const hasNet = hasPermission(PERMISSIONS.FOLLOWUP_NET_AMOUNT_READ);
  const skeletonWidths = hasNet
    ? IN_PROCESS_SKELETON_WIDTHS
    : IN_PROCESS_SKELETON_WIDTHS.filter((_, column) => column !== NET_COLUMN_INDEX);

  const shipments = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const netAmount = data?.summary.netAmount;
  const implementation = shippingCompanies.find(
    (company) => company.id === shippingCompanyId,
  )?.implementation;

  useEffect(() => {
    if (isSuccess && shipments.length === 0 && page > 1) {
      onPageChange(1);
    }
  }, [isSuccess, shipments.length, page, onPageChange]);

  return (
    <>
      <ListHeader
        view="in-process"
        carrier={data?.carrier}
        implementation={implementation}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-2 gap-3 sm:max-w-2xl">
        {isLoading ? (
          <SummaryStatCardSkeleton />
        ) : (
          <SummaryStatCard
            icon={<PackageSearch aria-hidden="true" />}
            iconBgClassName="bg-primary/10 text-primary"
            label={t('inProcess.kpi.results')}
            value={isError ? '—' : formatNumber(total)}
          />
        )}
        <Can code={PERMISSIONS.FOLLOWUP_NET_AMOUNT_READ}>
          {isLoading ? (
            <SummaryStatCardSkeleton />
          ) : (
            <SummaryStatCard
              icon={<CircleDollarSign aria-hidden="true" />}
              iconBgClassName="bg-primary/10 text-primary"
              label={t('inProcess.kpi.netInProcess')}
              value={isError || netAmount == null ? '—' : formatNumber(netAmount, 2) + ' جنيه'}
            />
          )}
        </Can>
      </div>

      <ViewTabs {...viewSwitch}>
        {controls}
        <p role="status" aria-live="polite" className="sr-only">
          {isLoading ? t('common.loading') : isFetching ? t('inProcess.refreshing') : ''}
        </p>
        {isLoading ? (
          <ResultsFrame busy={false}>
            <ListSkeleton widths={skeletonWidths} />
          </ResultsFrame>
        ) : isError ? (
          <ErrorState error={error} fallback={t('inProcess.error.load')} onRetry={() => refetch()} />
        ) : total === 0 ? (
          <EmptyState
            icon={EMPTY_STATE_ICON}
            title={
              hasActiveFilters
                ? t('inProcess.empty.filtered')
                : t('inProcess.empty.inProcess')
            }
            action={
              hasActiveFilters ? (
                <Button type="button" variant="outline" size="sm" onClick={onClearAll}>
                  {t('inProcess.filters.clear')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <ResultsFrame busy={isFetching}>
              {data && (
                <InProcessShipmentsTable
                  shipments={shipments}
                  shippingCompanyId={shippingCompanyId}
                  onOpenNotes={onOpenNotes}
                  onOpenActionLog={onOpenActionLog}
                />
              )}
            </ResultsFrame>
            <ListPagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </>
        )}
      </ViewTabs>
    </>
  );
}

function ReturnedList({
  shippingCompanyId,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  viewSwitch,
}: ListProps) {
  const { t } = useI18n();
  const { shippingCompanies } = useShippingCompanies();
  const {
    data,
    isLoading,
    isError,
    isFetching,
    isSuccess,
    error,
    refetch,
  } = useReturnedShipmentsQuery(shippingCompanyId, { page, limit });

  const shipments = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const implementation = shippingCompanies.find(
    (company) => company.id === shippingCompanyId,
  )?.implementation;

  useEffect(() => {
    if (isSuccess && shipments.length === 0 && page > 1) {
      onPageChange(1);
    }
  }, [isSuccess, shipments.length, page, onPageChange]);

  return (
    <>
      <ListHeader
        view="returned"
        carrier={data?.carrier}
        implementation={implementation}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-2 gap-3 sm:max-w-2xl">
        {isLoading ? (
          <SummaryStatCardSkeleton />
        ) : (
          <SummaryStatCard
            icon={<ClipboardList aria-hidden="true" />}
            iconBgClassName="bg-primary/10 text-primary"
            label={t('inProcess.kpi.returnedCount')}
            value={isError ? '—' : formatNumber(total)}
          />
        )}
      </div>

      <ViewTabs {...viewSwitch}>
        <p role="status" aria-live="polite" className="sr-only">
          {isLoading ? t('common.loading') : isFetching ? t('inProcess.refreshing') : ''}
        </p>
        {isLoading ? (
          <ResultsFrame busy={false}>
            <ListSkeleton widths={RETURNED_SKELETON_WIDTHS} />
          </ResultsFrame>
        ) : isError ? (
          <ErrorState error={error} fallback={t('inProcess.error.load')} onRetry={() => refetch()} />
        ) : total === 0 ? (
          <EmptyState icon={EMPTY_STATE_ICON} title={t('inProcess.empty.returned')} />
        ) : (
          <>
            <ResultsFrame busy={isFetching}>
              {data && <ReturnedShipmentsTable shipments={shipments} />}
            </ResultsFrame>
            <ListPagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </>
        )}
      </ViewTabs>
    </>
  );
}

interface InProcessShipmentsContentProps {
  shippingCompanyId: number;
}

export function InProcessShipmentsContent({
  shippingCompanyId,
}: InProcessShipmentsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getStatusLabel } = useStatusLabel();
  const { hasPermission } = usePermissionCheck();
  const canInProcess = hasPermission(PERMISSIONS.FOLLOWUP_CARRIERS_IN_TRANSIT_VIEW);
  const canReturned = hasPermission(PERMISSIONS.FOLLOWUP_CARRIERS_RETURNED_VIEW);

  const view = resolveView(searchParams.get('view'), canInProcess, canReturned);
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const status = readStatus(searchParams.get('status'));
  const governorate = searchParams.get('governorate') ?? '';
  const city = searchParams.get('city') ?? '';
  const search = searchParams.get('search') ?? '';
  const workState = readWorkState(searchParams.get('workState'));
  const page = readPage(searchParams.get('page'));

  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);
  const [appliedSearch, setAppliedSearch] = useState(search);
  const appliedSearchRef = useRef(search);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const viewFocusRef = useRef(false);

  useEffect(() => {
    const nextSearch = debouncedSearch.trim();
    const urlSearch = new URLSearchParams(window.location.search).get('search') ?? '';
    if (nextSearch !== urlSearch) {
      window.history.replaceState(
        null,
        '',
        buildSearchUrl(pathname, new URLSearchParams(window.location.search), {
          search: nextSearch,
          page: '',
        }),
      );
    }
    appliedSearchRef.current = nextSearch;
    startTransition(() => setAppliedSearch(nextSearch));
  }, [debouncedSearch, pathname]);

  useEffect(() => {
    if (search === appliedSearchRef.current) return;
    appliedSearchRef.current = search;
    setSearchInput(search);
    startTransition(() => setAppliedSearch(search));
  }, [search]);

  const updateParams = (patch: Record<string, string>) =>
    router.replace(
      buildSearchUrl(pathname, searchParams, { search: appliedSearchRef.current, ...patch }),
      { scroll: false },
    );

  const { data: governorates = [] } = useGovernoratesQuery();
  const { data: cities = [], isLoading: citiesLoading } = useCitiesQuery(governorate || undefined);

  const statusOptions = IN_PROCESS_STATUSES.map((value) => ({
    key: value,
    label: getStatusLabel(value),
  }));

  const filters: InProcessFilters = {
    from: from || undefined,
    to: to || undefined,
    status,
    governorate: governorate || undefined,
    city: city || undefined,
    search: appliedSearch || undefined,
    workState,
    page,
    limit,
  };

  const handlePageChange = (nextPage: number) =>
    updateParams({ page: nextPage > 1 ? String(nextPage) : '' });

  const handlePageSizeChange = (size: number) => {
    setLimit(Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
    updateParams({ page: '' });
  };

  const isInProcess = view === 'in-process';
  const [notesOrderId, setNotesOrderId] = useState<number | null>(null);
  const [actionLogOrderId, setActionLogOrderId] = useState<number | null>(null);

  const activeCount = [status, governorate, city, from, to, appliedSearch].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchInput('');
    updateParams({
      status: '',
      governorate: '',
      city: '',
      from: '',
      to: '',
      search: '',
      page: '',
    });
    searchInputRef.current?.focus();
  };

  const viewSwitch: ViewSwitchProps = {
    view,
    canInProcess,
    canReturned,
    restoreFocusRef: viewFocusRef,
    onViewChange: (next) => {
      viewFocusRef.current = true;
      updateParams({ view: next === 'returned' ? 'returned' : '', page: '' });
    },
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="px-4 sm:px-8 py-4 flex flex-col gap-5">
        {isInProcess ? (
          <InProcessList
            shippingCompanyId={shippingCompanyId}
            filters={filters}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            viewSwitch={viewSwitch}
            hasActiveFilters={activeCount > 0}
            onClearAll={clearAllFilters}
            controls={
              <InProcessControls
                status={status}
                statusOptions={statusOptions}
                governorate={governorate}
                governorates={governorates}
                city={city}
                cities={cities}
                citiesLoading={citiesLoading}
                from={from}
                to={to}
                searchInput={searchInput}
                appliedSearch={appliedSearch}
                activeCount={activeCount}
                workState={workState}
                onPatch={updateParams}
                onClearAll={clearAllFilters}
                onSearchChange={setSearchInput}
                searchInputRef={searchInputRef}
              />
            }
            onOpenNotes={setNotesOrderId}
            onOpenActionLog={setActionLogOrderId}
          />
        ) : (
          <ReturnedList
            shippingCompanyId={shippingCompanyId}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            viewSwitch={viewSwitch}
          />
        )}
      </div>
      {notesOrderId !== null && (
        <FollowupNotesModal orderId={notesOrderId} onClose={() => setNotesOrderId(null)} />
      )}
      {actionLogOrderId !== null && (
        <OrderActionLogModal orderId={actionLogOrderId} onClose={() => setActionLogOrderId(null)} />
      )}
    </div>
  );
}
