'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { FilterOptions, Order } from '@/types/orders';
import FilterPanelRHF, {
  FilterKey,
  FILTER_DEFINITIONS,
} from '@/app/dashboard/orders/allOrders/components/FilterSection/FilterPanelRHF';
import {
  LiaSlidersHSolid,
  LiaAngleDownSolid,
  LiaPrintSolid,
} from 'react-icons/lia';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { PERMISSION_CODES } from '@/lib/permissions';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { PrintStatusToggle } from './PrintStatusToggle';
import { PrintInvoicesModal } from './PrintInvoicesModal';
import { PrintConfirmDialog } from './PrintConfirmDialog';
import {
  PrintStatus,
  PrintOrderStatistics,
  PrintJob,
  PrintSkippedOrder,
} from '../../print-orders/types';
import { useInvoicePrinter, useInvoiceSettings } from '../../print-orders/hooks';
import {
  mapOrdersToInvoices,
  preloadShippingLogos,
  printApiErrorMessage,
} from '../../print-orders/utils';
import { InvoiceRenderer } from '../../print-orders/components/InvoiceRenderer';
import { claimOrdersForPrint } from '../../print-orders/services/printOrders';

export interface ShippingCompanyOption {
  key: string;
  label: string;
}

interface FilterSectionProps {
  control: Control<OrderFiltersFormData>;
  errors: FieldErrors<OrderFiltersFormData>;
  options?: FilterOptions;
  setValue?: UseFormSetValue<OrderFiltersFormData>;
  initialFormFilters?: OrderFiltersFormData | null;
  printStatus: PrintStatus;
  onPrintStatusChange: (status: PrintStatus) => void;
  printStatistics?: PrintOrderStatistics | null;
  selectedOrders?: Order[];
  showPrintButton?: boolean;
  showPrintStatusToggle?: boolean;
  shippingCompanyOptions?: ShippingCompanyOption[];
  selectedShippingCompany?: string;
  onShippingCompanyChange?: (value: string) => void;
  showShippingCompanySelect?: boolean;
  isLoadingShippingCompanies?: boolean;
  onActiveFiltersChange?: (activeFilters: FilterKey[]) => void;
  currentStatus?: string | null;
  hiddenFilters?: FilterKey[];
  onPrintFlowOpenChange?: (open: boolean) => void;
}

const UNPRINTABLE_SKIP_MESSAGES: Partial<
  Record<PrintSkippedOrder['reason'], (count: number) => string>
> = {
  CLAIMED_BY_OTHER: (count) => `${count} طلب يطبعه مستخدم آخر الآن`,
  PARKED: (count) => `${count} طلب معلّق بسبب إيقاف المتجر مؤقتًا`,
  NOT_FOUND: (count) => `${count} طلب غير موجود`,
};

function warnUnprintable(skipped: PrintSkippedOrder[]) {
  for (const [reason, message] of Object.entries(UNPRINTABLE_SKIP_MESSAGES)) {
    const count = skipped.filter((s) => s.reason === reason).length;
    if (count > 0 && message) toast.warning(message(count));
  }
}

function getActiveFiltersFromFormValues(
  formFilters: OrderFiltersFormData | null | undefined,
  hiddenFilters: FilterKey[] = []
): FilterKey[] {
  if (!formFilters) return [];

  const activeKeys: FilterKey[] = [];

  for (const def of FILTER_DEFINITIONS) {
    if (def.key === 'employeeName') continue;
    if (hiddenFilters.includes(def.key)) continue;

    const value = formFilters[def.key as keyof OrderFiltersFormData];
    const isActive = Array.isArray(value)
      ? value.length > 0
      : value !== undefined && value !== '' && value !== null;
    if (isActive) {
      activeKeys.push(def.key);
    }
  }

  return activeKeys;
}

export function FilterSection({
  control,
  errors,
  options = {
    productOptions: [],
    sizeColorOptions: [],
    governorateOptions: [],
    areaOptions: [],
  },
  setValue,
  initialFormFilters,
  printStatus,
  onPrintStatusChange,
  printStatistics,
  selectedOrders = [],
  showPrintButton = true,
  showPrintStatusToggle = true,
  shippingCompanyOptions = [],
  selectedShippingCompany = '',
  onShippingCompanyChange,
  showShippingCompanySelect = false,
  isLoadingShippingCompanies = false,
  onActiveFiltersChange,
  currentStatus,
  hiddenFilters = [],
  onPrintFlowOpenChange,
}: FilterSectionProps) {
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>(() =>
    getActiveFiltersFromFormValues(initialFormFilters, hiddenFilters)
  );
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isClaimingSelected, setIsClaimingSelected] = useState(false);
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);

  const hasInitializedRef = useRef(false);
  const printer = useInvoicePrinter();
  const { storeInfo, language } = useInvoiceSettings();
  const isPrintFlowOpen =
    isPrintModalOpen || isClaimingSelected || printJob !== null;

  useEffect(() => {
    onPrintFlowOpenChange?.(isPrintFlowOpen);
  }, [isPrintFlowOpen, onPrintFlowOpenChange]);

  useEffect(() => {
    preloadShippingLogos();
  }, []);

  useEffect(() => {
    if (!initialFormFilters) return;

    const filtersFromUrl = getActiveFiltersFromFormValues(
      initialFormFilters,
      hiddenFilters
    );
    if (filtersFromUrl.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setActiveFilters((prev) => {
        const merged = new Set([...prev, ...filtersFromUrl]);
        return Array.from(merged);
      });
    }
  }, [initialFormFilters, hiddenFilters]);

  const visibleDefinitions = useMemo(
    () =>
      FILTER_DEFINITIONS.filter((f) => {
        if (hiddenFilters.includes(f.key)) return false;
        if (!f.visibleStatuses) return true;
        return currentStatus && f.visibleStatuses.includes(currentStatus);
      }),
    [currentStatus, hiddenFilters]
  );

  useEffect(() => {
    const visibleKeys = new Set(visibleDefinitions.map((f) => f.key));
    setActiveFilters((prev) => {
      const filtersToRemove = prev.filter((key) => !visibleKeys.has(key));
      if (filtersToRemove.length === 0) return prev;

      filtersToRemove.forEach((filterKey) => {
        if (!setValue || filterKey === 'employeeName') return;
        const def = FILTER_DEFINITIONS.find((f) => f.key === filterKey);
        if (def?.type === 'multiselect') {
          setValue(filterKey as keyof OrderFiltersFormData, [] as any, {
            shouldDirty: true,
            shouldValidate: true,
          });
        } else if (filterKey === 'skipFilters') {
          setValue('skipFilters', undefined, { shouldDirty: true, shouldValidate: true });
        } else {
          setValue(filterKey as keyof OrderFiltersFormData, '', {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      });

      const next = prev.filter((key) => visibleKeys.has(key));
      onActiveFiltersChange?.(next);
      return next;
    });
  }, [visibleDefinitions, setValue, onActiveFiltersChange]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const addFilter = (filterKey: FilterKey) => {
    if (!activeFilters.includes(filterKey)) {
      const next = [...activeFilters, filterKey];
      setActiveFilters(next);
      onActiveFiltersChange?.(next);
      if (setValue && filterKey === 'skipFilters') {
        setValue('skipFilters', true, { shouldDirty: true, shouldValidate: true });
      }
    }
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const removeFilter = (filterKey: FilterKey) => {
    const next = activeFilters.filter((f) => f !== filterKey);
    setActiveFilters(next);
    onActiveFiltersChange?.(next);
    if (setValue && filterKey !== 'employeeName') {
      const def = FILTER_DEFINITIONS.find((f) => f.key === filterKey);
      if (def?.type === 'multiselect') {
        setValue(filterKey as keyof OrderFiltersFormData, [] as any, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else if (filterKey === 'skipFilters') {
        setValue('skipFilters', undefined, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        setValue(filterKey as keyof OrderFiltersFormData, '', {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  };

  const availableFilters = visibleDefinitions.filter(
    (f) => !activeFilters.includes(f.key)
  );
  const filteredOptions = availableFilters.filter((f) =>
    f.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintClick = async () => {
    if (selectedOrders && selectedOrders.length > 0) {
      await handlePrintSelectedOrders();
    } else {
      setIsPrintModalOpen(true);
    }
  };

  const startPrintJob = async (printable: Order[], job: PrintJob) => {
    await printer.print(mapOrdersToInvoices(printable, language));
    setPrintJob(job);
  };

  const handleCountClaimed = async (claimed: Order[]) => {
    await startPrintJob(claimed, {
      claimedIds: claimed.map((order) => order.id),
      markIds: [],
      reprintIds: [],
    });
  };

  const handlePrintSelectedOrders = async () => {
    if (!selectedOrders || selectedOrders.length === 0 || isClaimingSelected) {
      return;
    }

    setIsClaimingSelected(true);
    try {
      const { claimed, skipped } = await claimOrdersForPrint(
        selectedOrders.map((order) => order.id)
      );
      const claimedById = new Map(claimed.map((order) => [order.id, order]));
      const reprintIds = new Set(
        skipped.filter((s) => s.reason === 'PRINTED').map((s) => s.id)
      );
      const markIds = new Set(
        skipped.filter((s) => s.reason === 'NOT_CONFIRMED').map((s) => s.id)
      );
      warnUnprintable(skipped);

      const printable = selectedOrders
        .map((order) =>
          claimedById.get(order.id) ??
          (reprintIds.has(order.id) || markIds.has(order.id) ? order : null)
        )
        .filter((order): order is Order => order !== null);

      if (printable.length === 0) {
        toast.error('لا توجد طلبات متاحة للطباعة');
        return;
      }

      await startPrintJob(printable, {
        claimedIds: Array.from(claimedById.keys()),
        markIds: Array.from(markIds),
        reprintIds: Array.from(reprintIds),
      });
    } catch (error) {
      toast.error(printApiErrorMessage(error, 'تعذر حجز الطلبات للطباعة'));
    } finally {
      setIsClaimingSelected(false);
    }
  };

  const handlePrintJobClose = () => {
    setPrintJob(null);
    printer.clear();
  };

  return (
    <div className="bg-white rounded-xl py-[3px] mt-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2">
        <div className="flex items-center gap-3">
          <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <PopoverTrigger asChild>
              <Button variant="default" size="lg">
                <LiaSlidersHSolid className="size-5" />
                <span>فلتر</span>
                <LiaAngleDownSolid
                  className={clsx(
                    'size-4 transition-transform duration-200',
                    isDropdownOpen && 'rotate-180'
                  )}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[220px] p-0 border border-gray-200"
            >
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث..."
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
              </div>

              <ul className="max-h-48 overflow-y-auto py-1">
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-gray-500 text-base text-center">
                    {availableFilters.length === 0
                      ? 'تم اضافة جميع الفلاتر'
                      : 'لا توجد نتائج'}
                  </li>
                ) : (
                  filteredOptions.map((filter) => (
                    <li
                      key={filter.key}
                      className="px-3 py-2 cursor-pointer text-gray-700 text-base hover:bg-primary hover:text-white transition-colors"
                      onClick={() => addFilter(filter.key)}
                    >
                      {filter.label}
                    </li>
                  ))
                )}
              </ul>
            </PopoverContent>
          </Popover>

          {showPrintButton && (
            <Can code={PERMISSION_CODES.ORDERS_PRINT}>
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrintClick}
                disabled={isClaimingSelected}
                aria-label="طباعة الفواتير"
                title="طباعة الفواتير"
              >
                <LiaPrintSolid className="size-5" />
              </Button>
            </Can>
          )}

          {showShippingCompanySelect && (
            <SearchableSelect
              value={selectedShippingCompany}
              onChange={onShippingCompanyChange}
              options={shippingCompanyOptions}
              placeholder="شركة الشحن"
              loading={isLoadingShippingCompanies}
              widthClass="w-[180px]"
            />
          )}
        </div>

        {showPrintStatusToggle && (
          <PrintStatusToggle
            value={printStatus}
            onChange={onPrintStatusChange}
            printStatistics={printStatistics}
          />
        )}
      </div>

      {activeFilters.length > 0 && (
        <FilterPanelRHF
          control={control}
          errors={errors}
          options={options}
          setValue={setValue}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
        />
      )}

      <PrintInvoicesModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onClaimed={handleCountClaimed}
      />

      <PrintConfirmDialog
        job={printJob}
        invoiceCount={printer.invoices.length}
        onReprint={() => printer.print()}
        onClose={handlePrintJobClose}
      />

      {typeof window !== 'undefined' &&
        printer.invoices.length > 0 &&
        createPortal(
          <div
            ref={printer.containerRef}
            className="print-container hidden print:block"
          >
            {printer.invoices.map((invoice, index) => (
              <InvoiceRenderer
                key={index}
                data={invoice}
                storeInfo={storeInfo}
                language={language}
              />
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
