'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
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
import BaseModal from '@/components/ui/base-modal';
import { PrintStatusToggle } from './PrintStatusToggle';
import { PrintInvoicesModal } from './PrintInvoicesModal';
//TODO: Fix these imports after moving types and utils
import {
  PrintStatus,
  InvoiceData,
  InvoiceLanguage,
} from '../../print-orders/types';
import { mapOrdersToInvoices } from '../../print-orders/utils';
import { Invoice } from '../../print-orders/components/Invoice';
import { STORE_INFO } from '../../print-orders/constants';

interface FilterSectionProps {
  control: Control<OrderFiltersFormData>;
  errors: FieldErrors<OrderFiltersFormData>;
  options?: FilterOptions;
  setValue?: UseFormSetValue<OrderFiltersFormData>;
  initialFormFilters?: OrderFiltersFormData | null;
  printStatus: PrintStatus;
  onPrintStatusChange: (status: PrintStatus) => void;
  printedCount?: number;
  notPrintedCount?: number;
  selectedOrders?: Order[];
}

function getActiveFiltersFromFormValues(
  formFilters: OrderFiltersFormData | null | undefined
): FilterKey[] {
  if (!formFilters) return [];

  const activeKeys: FilterKey[] = [];

  for (const def of FILTER_DEFINITIONS) {
    if (def.key === 'employeeName') continue;

    const value = formFilters[def.key as keyof OrderFiltersFormData];
    if (value !== undefined && value !== '' && value !== null) {
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
  printedCount = 0,
  notPrintedCount = 0,
  selectedOrders = [],
}: FilterSectionProps) {
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>(() =>
    getActiveFiltersFromFormValues(initialFormFilters)
  );
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [invoicesToPrint, setInvoicesToPrint] = useState<InvoiceData[]>([]);
  const [selectedLanguage, setSelectedLanguage] =
    useState<InvoiceLanguage>('ar');

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!initialFormFilters) return;

    const filtersFromUrl = getActiveFiltersFromFormValues(initialFormFilters);
    if (filtersFromUrl.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setActiveFilters((prev) => {
        const merged = new Set([...prev, ...filtersFromUrl]);
        return Array.from(merged);
      });
    }
  }, [initialFormFilters]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const addFilter = (filterKey: FilterKey) => {
    if (!activeFilters.includes(filterKey)) {
      setActiveFilters([...activeFilters, filterKey]);
    }
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const removeFilter = (filterKey: FilterKey) => {
    setActiveFilters(activeFilters.filter((f) => f !== filterKey));
    if (setValue && filterKey !== 'employeeName') {
      if (filterKey === 'newFirst') {
        setValue('newFirst', undefined, {
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

  const availableFilters = FILTER_DEFINITIONS.filter(
    (f) => !activeFilters.includes(f.key)
  );
  const filteredOptions = availableFilters.filter((f) =>
    f.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintClick = () => {
    if (selectedOrders && selectedOrders.length > 0) {
      setShowLanguagePicker(true);
    } else {
      setIsPrintModalOpen(true);
    }
  };

  const handleLanguageSelect = (language: InvoiceLanguage) => {
    setShowLanguagePicker(false);
    if (!selectedOrders || selectedOrders.length === 0) return;

    setSelectedLanguage(language);
    const invoices = mapOrdersToInvoices(selectedOrders, language);
    setInvoicesToPrint(invoices);

    setTimeout(() => {
      window.print();
      setTimeout(() => setInvoicesToPrint([]), 500);
    }, 100);
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

          <Button variant="outline" size="lg" onClick={handlePrintClick}>
            <LiaPrintSolid className="size-5" />
          </Button>
        </div>

        <PrintStatusToggle
          value={printStatus}
          onChange={onPrintStatusChange}
          printedCount={printedCount}
          notPrintedCount={notPrintedCount}
        />
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
      />

      <BaseModal
        isOpen={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        title="اختر لغة الفاتورة"
        showFooter={false}
        maxWidth="w-[400px]"
      >
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => handleLanguageSelect('ar')}
            variant="outline"
            className="w-full"
          >
            العربية
          </Button>
          <Button
            onClick={() => handleLanguageSelect('en')}
            variant="outline"
            className="w-full"
          >
            English
          </Button>
        </div>
      </BaseModal>

      {typeof window !== 'undefined' &&
        invoicesToPrint.length > 0 &&
        createPortal(
          <div className="print-container hidden print:block">
            {invoicesToPrint.map((invoice, index) => (
              <Invoice
                key={index}
                data={invoice}
                storeInfo={STORE_INFO}
                language={selectedLanguage}
              />
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
