'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Can } from '@/components/Can';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { PERMISSIONS } from '@/lib/permissions';
import { useGovernoratesQuery, useCitiesQuery } from '@/services/lookups';
import {
  useInProcessShipmentsQuery,
  useReturnedShipmentsQuery,
} from '@/services/shippingProviders';
import { FOLLOWUP_WORK_STATES, type FollowupWorkState } from '@/types/logistics';
import {
  IN_PROCESS_STATUSES,
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

type ShipmentView = 'in-process' | 'returned';

const WORK_STATE_LABELS: Record<FollowupWorkState, string> = {
  open: 'مفتوح',
  closed: 'مغلق',
  all: 'الكل',
};

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

interface ListProps {
  shippingCompanyId: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

interface InProcessListProps extends ListProps {
  filters: InProcessFilters;
  onOpenNotes: (orderId: number) => void;
  onOpenActionLog: (orderId: number) => void;
}

function InProcessList({
  shippingCompanyId,
  filters,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  onOpenNotes,
  onOpenActionLog,
}: InProcessListProps) {
  const {
    data,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useInProcessShipmentsQuery(shippingCompanyId, filters);

  const shipments = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const carrierName = data?.carrier.name ?? '';

  useEffect(() => {
    if (isSuccess && shipments.length === 0 && page > 1) {
      onPageChange(1);
    }
  }, [isSuccess, shipments.length, page, onPageChange]);

  return (
    <>
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          الشحنات الحالية - {carrierName}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          طلبات لدى جهة الشحن لم تُسلَّم ولم تُرتجع بعد
        </p>
      </div>

      <div className="flex flex-wrap gap-6 border-b border-gray-100 pb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">نتائج العرض</span>
          <span className="text-lg font-bold text-gray-900">{formatNumber(total)}</span>
        </div>
        <Can code={PERMISSIONS.FOLLOWUP_NET_AMOUNT_READ}>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">صافي الشحنات الحالية</span>
            <span className="text-lg font-bold text-gray-900">
              {formatNumber(data?.summary.netAmount, 2)} جنيه
            </span>
          </div>
        </Can>
      </div>

      {isLoading ? (
        <PageLoading message="جاري تحميل الشحنات الحالية..." />
      ) : isError ? (
        <ListError onRetry={() => refetch()} />
      ) : total === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">
          لا توجد شحنات جارية لهذه الجهة في هذه الفترة
        </p>
      ) : (
        <>
          <div className="border border-gray-200 rounded-xl bg-white overflow-x-auto">
            {data && (
              <InProcessShipmentsTable
                shipments={shipments}
                carrier={data.carrier}
                shippingCompanyId={shippingCompanyId}
                onOpenNotes={onOpenNotes}
                onOpenActionLog={onOpenActionLog}
              />
            )}
          </div>
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
    </>
  );
}

function ReturnedList({
  shippingCompanyId,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
}: ListProps) {
  const {
    data,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useReturnedShipmentsQuery(shippingCompanyId, { page, limit });

  const shipments = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const carrierName = data?.carrier.name ?? '';

  useEffect(() => {
    if (isSuccess && shipments.length === 0 && page > 1) {
      onPageChange(1);
    }
  }, [isSuccess, shipments.length, page, onPageChange]);

  return (
    <>
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          مرتجع في الشركة - {carrierName}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          طلبات أعادتها جهة الشحن إلينا، ولا تتغير حالتها من هذه الصفحة
        </p>
      </div>

      <div className="flex flex-wrap gap-6 border-b border-gray-100 pb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">عدد الطلبات</span>
          <span className="text-lg font-bold text-gray-900">{formatNumber(total)}</span>
        </div>
      </div>

      {isLoading ? (
        <PageLoading message="جاري تحميل المرتجعات..." />
      ) : isError ? (
        <ListError onRetry={() => refetch()} />
      ) : total === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">لا توجد طلبات مرتجعة لهذه الجهة</p>
      ) : (
        <>
          <div className="border border-gray-200 rounded-xl bg-white overflow-x-auto">
            {data && <ReturnedShipmentsTable shipments={shipments} carrier={data.carrier} />}
          </div>
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
    </>
  );
}

function ListError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <p className="text-sm text-gray-500">تعذر تحميل الشحنات</p>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          إعادة المحاولة
        </Button>
        <Link href="/dashboard/shipping-providers" className="text-sm text-primary hover:underline">
          رجوع إلى جهات الشحن
        </Link>
      </div>
    </div>
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
  const lastWrittenSearch = useRef(search);

  useEffect(() => {
    const nextSearch = debouncedSearch.trim();
    if (nextSearch === lastWrittenSearch.current) return;
    lastWrittenSearch.current = nextSearch;
    window.history.replaceState(
      null,
      '',
      buildSearchUrl(pathname, new URLSearchParams(window.location.search), {
        search: nextSearch,
        page: '',
      }),
    );
    startTransition(() => setAppliedSearch(nextSearch));
  }, [debouncedSearch, pathname]);

  useEffect(() => {
    const onPopState = () => {
      const restored = new URLSearchParams(window.location.search).get('search') ?? '';
      lastWrittenSearch.current = restored;
      setSearchInput(restored);
      startTransition(() => setAppliedSearch(restored));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const updateParams = (patch: Record<string, string>) =>
    router.replace(
      buildSearchUrl(pathname, searchParams, { search: searchInput.trim(), ...patch }),
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

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="sm:px-8 py-4 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard/shipping-providers"
            className="text-xs text-primary hover:underline w-fit"
          >
            رجوع إلى جهات الشحن
          </Link>
          <div className="flex flex-wrap gap-2">
            {canInProcess && (
              <Button
                type="button"
                variant={isInProcess ? 'default' : 'outline'}
                size="sm"
                className="rounded-full text-xs px-4"
                onClick={() => updateParams({ view: '', page: '' })}
              >
                الشحنات الحالية
              </Button>
            )}
            {canReturned && (
              <Button
                type="button"
                variant={isInProcess ? 'outline' : 'default'}
                size="sm"
                className="rounded-full text-xs px-4"
                onClick={() => updateParams({ view: 'returned', page: '' })}
              >
                مرتجع في الشركة
              </Button>
            )}
          </div>
        </div>

        {isInProcess && (
          <>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1 w-44">
                <span className="text-xs text-gray-500">الحالة</span>
                <SearchableSelect
                  id="in-process-status"
                  value={status ?? ''}
                  onChange={(value) => updateParams({ status: value, page: '' })}
                  options={statusOptions}
                  placeholder="كل الحالات"
                  clearable
                  widthClass="w-full"
                />
              </div>
              <div className="flex flex-col gap-1 w-44">
                <span className="text-xs text-gray-500">المحافظة</span>
                <SearchableSelect
                  id="in-process-governorate"
                  value={governorate}
                  onChange={(value) => updateParams({ governorate: value, city: '', page: '' })}
                  options={governorates}
                  placeholder="كل المحافظات"
                  clearable
                  widthClass="w-full"
                />
              </div>
              <div className="flex flex-col gap-1 w-44">
                <span className="text-xs text-gray-500">المنطقة</span>
                <SearchableSelect
                  id="in-process-city"
                  value={city}
                  onChange={(value) => updateParams({ city: value, page: '' })}
                  options={cities}
                  placeholder={governorate ? 'كل المناطق' : 'اختر المحافظة أولاً'}
                  disabled={!governorate || citiesLoading}
                  clearable
                  widthClass="w-full"
                />
              </div>
              <Input
                type="date"
                label="استلام من"
                value={from}
                onChange={(e) => updateParams({ from: e.target.value, page: '' })}
                className="w-40"
              />
              <Input
                type="date"
                label="استلام إلى"
                value={to}
                onChange={(e) => updateParams({ to: e.target.value, page: '' })}
                className="w-40"
              />
              <Input
                type="text"
                label="بحث"
                placeholder="الكود، رقم الشحنة، العميل أو الهاتف"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onClear={() => setSearchInput('')}
                clearable
                maxLength={100}
                className="w-72"
              />
            </div>

            {appliedSearch && (
              <p className="text-xs text-amber-700">
                البحث يعرض كل الحالات ويتجاهل الفلاتر الأخرى
              </p>
            )}

            <div className="flex gap-2">
              {FOLLOWUP_WORK_STATES.map((state) => (
                <Button
                  key={state}
                  type="button"
                  variant={workState === state ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full text-xs px-4"
                  onClick={() => updateParams({ workState: state, page: '' })}
                >
                  {WORK_STATE_LABELS[state]}
                </Button>
              ))}
            </div>
          </>
        )}

        {isInProcess ? (
          <InProcessList
            shippingCompanyId={shippingCompanyId}
            filters={filters}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
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
