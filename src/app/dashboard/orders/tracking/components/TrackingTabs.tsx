'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LiaClipboardListSolid,
  LiaClockSolid,
  LiaCheckDoubleSolid,
} from 'react-icons/lia';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import LoadingAnimation from '@/components/ui/loadingAnimation';
import PaginationFooter from '@/components/ui/pagination-footer';
import type { TrackingCard as TrackingCardType, FollowupOrder, FollowupFilters } from '@/types/logistics';
import { useShippingEventsQuery } from '@/services/lookups';
import {
  useFollowupNewOrdersQuery,
  useFollowupOverdueQuery,
  useFollowupExecutedQuery,
} from '@/services/followup';
import TrackingCard from './TrackingCard';
import TrackingEmptyState from './TrackingEmptyState';
import { useDebounce } from '@/utils/debounce';

function mapFollowupOrderToCard(
  order: FollowupOrder,
  uiStatus: 'PENDING' | 'OVERDUE' | 'COMPLETED'
): TrackingCardType {
  const latestShipping = order.shippingEvents?.[0];
  const latestFollowup = order.followupEvents?.[0];

  return {
    id: order.id,
    orderId: order.id,
    orderCode: order.code,
    type: 'COURIER',
    scheduledDate: order.firstAttemptAt ?? order.createdAt,
    status: uiStatus,
    courierUpdate: latestShipping?.note ?? latestShipping?.name ?? null,
    courierName: order.delegateName ?? null,
    courierPhone: order.delegatePhone ?? null,
    agentStatus: latestFollowup?.name ?? null,
    agentFlag: null,
    agentNote: latestFollowup?.note ?? null,
    agentEventAt: latestFollowup?.createdAt ?? null,
    postponedUntil: order.postponedUntil ?? null,
    completedAt: uiStatus === 'COMPLETED' ? (latestFollowup?.createdAt ?? order.updatedAt) : null,
    employeeId: latestFollowup?.employeeId ?? null,
    employeeName: latestFollowup?.employee?.name ?? null,
    shippingEventId: latestShipping?.id ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    order,
  };
}

function buildFollowupFilters(
  debouncedSearch: string,
  shippingEvent: string,
  pageSize: number,
  page: number,
  extras: Partial<FollowupFilters> = {}
): FollowupFilters {
  const next: FollowupFilters = { ...extras, limit: pageSize, page };
  const trimmed = debouncedSearch.trim();
  if (trimmed) next.search = trimmed;
  if (shippingEvent) next.shippingStatuses = [shippingEvent];
  return next;
}

interface TrackingFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  shippingEvent: string;
  onShippingEventChange: (value: string) => void;
  shippingEventOptions: string[];
  isLoadingShippingEvents: boolean;
}

function TrackingFiltersBar({
  search,
  onSearchChange,
  shippingEvent,
  onShippingEventChange,
  shippingEventOptions,
  isLoadingShippingEvents,
}: TrackingFiltersBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4" dir="rtl">
      <Input
        type="text"
        placeholder="بحث بكود الطلب أو اسم العميل..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        clearable
        className="flex-1"
        inputClassName="bg-white"
      />
      <SearchableSelect
        value={shippingEvent}
        onChange={onShippingEventChange}
        options={shippingEventOptions}
        placeholder="حدد حالة الشحنة..."
        loading={isLoadingShippingEvents}
        clearable
        onClear={() => onShippingEventChange('')}
        widthClass="sm:w-48"
      />
    </div>
  );
}

type FollowupTabValue = 'pending' | 'overdue' | 'completed';

const DEFAULT_PAGE_SIZE = 20;

export default function TrackingTabs() {
  const [activeTab, setActiveTab] = useState<FollowupTabValue>('pending');
  const [visitedTabs, setVisitedTabs] = useState<Set<FollowupTabValue>>(() => new Set(['pending']));
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingShippingEvent, setPendingShippingEvent] = useState('');
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingExtras] = useState<Partial<FollowupFilters>>({});

  const [overdueSearch, setOverdueSearch] = useState('');
  const [overdueShippingEvent, setOverdueShippingEvent] = useState('');
  const [overduePage, setOverduePage] = useState(1);
  const [overdueExtras] = useState<Partial<FollowupFilters>>({});

  const [executedSearch, setExecutedSearch] = useState('');
  const [executedShippingEvent, setExecutedShippingEvent] = useState('');
  const [executedPage, setExecutedPage] = useState(1);
  const [executedExtras] = useState<Partial<FollowupFilters>>({});

  const debouncedPendingSearch = useDebounce(pendingSearch, 300);
  const debouncedOverdueSearch = useDebounce(overdueSearch, 300);
  const debouncedExecutedSearch = useDebounce(executedSearch, 300);

  const { data: shippingEvents, isLoading: isLoadingShippingEvents } = useShippingEventsQuery();
  const shippingEventOptions = useMemo(() => shippingEvents ?? [], [shippingEvents]);

  const handleTabChange = (value: string) => {
    const next = value as FollowupTabValue;
    setActiveTab(next);
    setVisitedTabs((prev) => {
      if (prev.has(next)) return prev;
      const updated = new Set(prev);
      updated.add(next);
      return updated;
    });
  };

  useEffect(() => {
    setPendingPage(1);
  }, [debouncedPendingSearch, pendingShippingEvent, pageSize]);

  useEffect(() => {
    setOverduePage(1);
  }, [debouncedOverdueSearch, overdueShippingEvent, pageSize]);

  useEffect(() => {
    setExecutedPage(1);
  }, [debouncedExecutedSearch, executedShippingEvent, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  const pendingFilters = useMemo<FollowupFilters>(
    () => buildFollowupFilters(debouncedPendingSearch, pendingShippingEvent, pageSize, pendingPage, pendingExtras),
    [debouncedPendingSearch, pendingShippingEvent, pageSize, pendingPage, pendingExtras]
  );
  const overdueFilters = useMemo<FollowupFilters>(
    () => buildFollowupFilters(debouncedOverdueSearch, overdueShippingEvent, pageSize, overduePage, overdueExtras),
    [debouncedOverdueSearch, overdueShippingEvent, pageSize, overduePage, overdueExtras]
  );
  const executedFilters = useMemo<FollowupFilters>(
    () => buildFollowupFilters(debouncedExecutedSearch, executedShippingEvent, pageSize, executedPage, executedExtras),
    [debouncedExecutedSearch, executedShippingEvent, pageSize, executedPage, executedExtras]
  );

  const newOrdersQuery = useFollowupNewOrdersQuery(pendingFilters, visitedTabs.has('pending'));
  const overdueQuery = useFollowupOverdueQuery(overdueFilters, visitedTabs.has('overdue'));
  const executedQuery = useFollowupExecutedQuery(executedFilters, visitedTabs.has('completed'));

  const pendingCards = useMemo(
    () => (newOrdersQuery.data?.data ?? []).map((o) => mapFollowupOrderToCard(o, 'PENDING')),
    [newOrdersQuery.data]
  );
  const overdueCards = useMemo(
    () => (overdueQuery.data?.data ?? []).map((o) => mapFollowupOrderToCard(o, 'OVERDUE')),
    [overdueQuery.data]
  );
  const completedCards = useMemo(
    () => (executedQuery.data?.data ?? []).map((o) => mapFollowupOrderToCard(o, 'COMPLETED')),
    [executedQuery.data]
  );

  const pendingMeta = newOrdersQuery.data?.meta;
  const overdueMeta = overdueQuery.data?.meta;
  const executedMeta = executedQuery.data?.meta;

  const pendingCount = pendingMeta?.total ?? pendingCards.length;
  const overdueCount = overdueMeta?.total ?? overdueCards.length;
  const completedCount = executedMeta?.total ?? completedCards.length;

  const pendingHasFilters = Boolean(debouncedPendingSearch.trim() || pendingShippingEvent);
  const overdueHasFilters = Boolean(debouncedOverdueSearch.trim() || overdueShippingEvent);
  const executedHasFilters = Boolean(debouncedExecutedSearch.trim() || executedShippingEvent);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList dir="rtl">
        <TabsTrigger value="pending" className="gap-2">
          طلبات جديدة
          <span className="inline-flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold min-w-[24px]">
            {pendingCount}
          </span>
        </TabsTrigger>
        <TabsTrigger value="overdue" className="gap-2">
          طلبات متأخرة
          <span className="inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-bold min-w-[24px] data-[state=active]:bg-white/20 data-[state=active]:text-white">
            {overdueCount}
          </span>
        </TabsTrigger>
        <TabsTrigger value="completed" className="gap-2">
          طلبات منفذة
          <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-bold min-w-[24px] data-[state=active]:bg-white/20 data-[state=active]:text-white">
            {completedCount}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" dir="rtl">
        <TrackingFiltersBar
          search={pendingSearch}
          onSearchChange={setPendingSearch}
          shippingEvent={pendingShippingEvent}
          onShippingEventChange={setPendingShippingEvent}
          shippingEventOptions={shippingEventOptions}
          isLoadingShippingEvents={isLoadingShippingEvents}
        />
        {newOrdersQuery.isLoading ? (
          <LoadingAnimation />
        ) : pendingCards.length > 0 ? (
          <div className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingCards.map((card) => (
                <TrackingCard key={card.id} card={card} />
              ))}
            </div>
            {pendingMeta && pendingMeta.totalPages > 1 && (
              <PaginationFooter
                currentPage={pendingMeta.page}
                totalPages={pendingMeta.totalPages}
                totalItems={pendingMeta.total}
                hasNextPage={pendingMeta.page < pendingMeta.totalPages}
                hasPreviousPage={pendingMeta.page > 1}
                onPageChange={setPendingPage}
                onPrevious={() => setPendingPage((p) => Math.max(1, p - 1))}
                onNext={() => setPendingPage((p) => Math.min(pendingMeta.totalPages, p + 1))}
                currentPageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        ) : (
          <TrackingEmptyState
            message={pendingHasFilters ? 'لا توجد نتائج مطابقة، جرّب تعديل البحث أو الفلاتر' : 'تم إنهاء جميع مهام المتابعة لليوم'}
            icon={<LiaClipboardListSolid />}
          />
        )}
      </TabsContent>

      <TabsContent value="overdue" dir="rtl">
        <TrackingFiltersBar
          search={overdueSearch}
          onSearchChange={setOverdueSearch}
          shippingEvent={overdueShippingEvent}
          onShippingEventChange={setOverdueShippingEvent}
          shippingEventOptions={shippingEventOptions}
          isLoadingShippingEvents={isLoadingShippingEvents}
        />
        {overdueQuery.isLoading ? (
          <LoadingAnimation />
        ) : overdueCards.length > 0 ? (
          <div className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {overdueCards.map((card) => (
                <TrackingCard key={card.id} card={card} />
              ))}
            </div>
            {overdueMeta && overdueMeta.totalPages > 1 && (
              <PaginationFooter
                currentPage={overdueMeta.page}
                totalPages={overdueMeta.totalPages}
                totalItems={overdueMeta.total}
                hasNextPage={overdueMeta.page < overdueMeta.totalPages}
                hasPreviousPage={overdueMeta.page > 1}
                onPageChange={setOverduePage}
                onPrevious={() => setOverduePage((p) => Math.max(1, p - 1))}
                onNext={() => setOverduePage((p) => Math.min(overdueMeta.totalPages, p + 1))}
                currentPageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        ) : (
          <TrackingEmptyState
            message={overdueHasFilters ? 'لا توجد نتائج مطابقة، جرّب تعديل البحث أو الفلاتر' : 'لا توجد طلبات متأخرة'}
            icon={<LiaClockSolid />}
          />
        )}
      </TabsContent>

      <TabsContent value="completed" dir="rtl">
        <TrackingFiltersBar
          search={executedSearch}
          onSearchChange={setExecutedSearch}
          shippingEvent={executedShippingEvent}
          onShippingEventChange={setExecutedShippingEvent}
          shippingEventOptions={shippingEventOptions}
          isLoadingShippingEvents={isLoadingShippingEvents}
        />
        {executedQuery.isLoading ? (
          <LoadingAnimation />
        ) : completedCards.length > 0 ? (
          <div className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedCards.map((card) => (
                <TrackingCard key={card.id} card={card} />
              ))}
            </div>
            {executedMeta && executedMeta.totalPages > 1 && (
              <PaginationFooter
                currentPage={executedMeta.page}
                totalPages={executedMeta.totalPages}
                totalItems={executedMeta.total}
                hasNextPage={executedMeta.page < executedMeta.totalPages}
                hasPreviousPage={executedMeta.page > 1}
                onPageChange={setExecutedPage}
                onPrevious={() => setExecutedPage((p) => Math.max(1, p - 1))}
                onNext={() => setExecutedPage((p) => Math.min(executedMeta.totalPages, p + 1))}
                currentPageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        ) : (
          <TrackingEmptyState
            message={executedHasFilters ? 'لا توجد نتائج مطابقة، جرّب تعديل البحث أو الفلاتر' : 'لم يتم إكمال أي مهام بعد اليوم'}
            icon={<LiaCheckDoubleSolid />}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
