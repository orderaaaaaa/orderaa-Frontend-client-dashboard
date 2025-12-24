import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { OrderStatus, FilterOrdersDto } from '@/types/orders';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { useFetchOrdersForSearch } from '@/services/orders';
import { TimePeriod, calculateDateRangeFromPeriod, formatDateToISO } from '@/utils/dateRangeUtils';
import { useDebounce, useDebouncedCallback } from '@/utils/debounce';
import { toast } from 'react-toastify';
import {
  isValidOrderStatus,
  isValidTimePeriod,
  formatDateForUrl,
  parseDateFromUrl,
} from '@/utils/urlFilters';

interface UseOrderDetailsNavigationOptions {
  initialOrderId: number;
}

interface UseOrderDetailsNavigationReturn {
  status: OrderStatus | null;
  setStatus: (status: OrderStatus | null) => void;
  fromDate: Date | null;
  setFromDate: (date: Date | null) => void;
  toDate: Date | null;
  setToDate: (date: Date | null) => void;
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  clearTimePeriod: () => void;

  targetOrderId: number | null;
  isNavigating: boolean;
  isEmpty: boolean;

  handleFilterFormChange: (data: OrderFiltersFormData) => void;
}


function buildApiFilters(
  status: OrderStatus | null,
  fromDate: Date | null,
  toDate: Date | null,
  formFilters: OrderFiltersFormData | null
): FilterOrdersDto {
  const filters: FilterOrdersDto = {
    page: 1,
  };

  if (status) filters.status = status;

  const hasConfirmedDate = formFilters?.executionDate;

  if (hasConfirmedDate) {
    filters.confirmedDate = formFilters.executionDate;
  } else {
    if (fromDate) filters.createdAfter = formatDateToISO(fromDate);
    if (toDate) filters.createdBefore = formatDateToISO(toDate);
  }

  if (formFilters) {
    if (formFilters.customerName) filters.customerName = formFilters.customerName;
    if (formFilters.phone) filters.customerPhone = formFilters.phone;
    if (formFilters.governorate) filters.governorate = formFilters.governorate;
    if (formFilters.city) filters.city = formFilters.city;
    if (formFilters.area) filters.area = formFilters.area;
    if (formFilters.productName) filters.productName = formFilters.productName;
    if (formFilters.shipmentCode) filters.code = formFilters.shipmentCode;
  }

  return filters;
}

export function useOrderDetailsNavigation({
  initialOrderId,
}: UseOrderDetailsNavigationOptions): UseOrderDetailsNavigationReturn {
  const { fetchOrdersForSearch } = useFetchOrdersForSearch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const hasMounted = useRef(false);
  const isUserInitiated = useRef(false);
  const isUpdatingUrl = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [targetOrderId, setTargetOrderId] = useState<number | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const getInitialState = useCallback(() => {
    if (!searchParams) {
      return { status: null, fromDate: null, toDate: null, timePeriod: '' as TimePeriod, formFilters: null };
    }

    const statusParam = searchParams.get('status');
    const status = statusParam && isValidOrderStatus(statusParam) ? (statusParam as OrderStatus) : null;
    const periodParam = searchParams.get('period');
    const timePeriod = periodParam && isValidTimePeriod(periodParam) ? (periodParam as TimePeriod) : '';
    const fromDate = parseDateFromUrl(searchParams.get('from'));
    const toDate = parseDateFromUrl(searchParams.get('to'));

    const formFilters: OrderFiltersFormData = {
      customerName: searchParams.get('customerName') || '',
      phone: searchParams.get('phone') || '',
      governorate: searchParams.get('governorate') || '',
      city: searchParams.get('city') || '',
      area: searchParams.get('area') || '',
      productName: searchParams.get('productName') || '',
      sizeColor: searchParams.get('sizeColor') || '',
      shipmentCode: searchParams.get('shipmentCode') || '',
      address: searchParams.get('address') || '',
      executionDate: searchParams.get('executionDate') || '',
    };

    const hasFormFilters = Object.values(formFilters).some(v => v !== '');

    return {
      status,
      fromDate,
      toDate,
      timePeriod,
      formFilters: hasFormFilters ? formFilters : null,
    };
  }, [searchParams]);

  const initialState = getInitialState();

  const [status, setStatusInternal] = useState<OrderStatus | null>(initialState.status);
  const [fromDate, setFromDateInternal] = useState<Date | null>(initialState.fromDate);
  const [toDate, setToDateInternal] = useState<Date | null>(initialState.toDate);
  const [timePeriod, setTimePeriodInternal] = useState<TimePeriod>(initialState.timePeriod);
  const [formFilters, setFormFilters] = useState<OrderFiltersFormData | null>(initialState.formFilters);

  const debouncedFormFilters = useDebounce(formFilters, 500);

  const [triggerVersion, setTriggerVersion] = useState(0);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const updateUrl = useCallback(
    (useReplace: boolean = false) => {
      const params = new URLSearchParams();

      if (status) params.set('status', status);
      if (timePeriod) params.set('period', timePeriod);

      if (!formFilters?.executionDate) {
        const fromStr = formatDateForUrl(fromDate);
        if (fromStr) params.set('from', fromStr);
        const toStr = formatDateForUrl(toDate);
        if (toStr) params.set('to', toStr);
      }

      if (formFilters) {
        if (formFilters.customerName) params.set('customerName', formFilters.customerName);
        if (formFilters.phone) params.set('phone', formFilters.phone);
        if (formFilters.governorate) params.set('governorate', formFilters.governorate);
        if (formFilters.city) params.set('city', formFilters.city);
        if (formFilters.area) params.set('area', formFilters.area);
        if (formFilters.productName) params.set('productName', formFilters.productName);
        if (formFilters.sizeColor) params.set('sizeColor', formFilters.sizeColor);
        if (formFilters.shipmentCode) params.set('shipmentCode', formFilters.shipmentCode);
        if (formFilters.address) params.set('address', formFilters.address);
        if (formFilters.executionDate) params.set('executionDate', formFilters.executionDate);
      }

      const newParamsString = params.toString();
      const newUrl = newParamsString ? `${pathname}?${newParamsString}` : pathname;

      isUpdatingUrl.current = true;

      if (useReplace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }

      setTimeout(() => {
        isUpdatingUrl.current = false;
      }, 100);
    },
    [pathname, router, status, fromDate, toDate, timePeriod, formFilters]
  );

  const debouncedUpdateUrl = useDebouncedCallback(
    () => updateUrl(true),
    500
  );

  const setStatus = useCallback((newStatus: OrderStatus | null) => {
    isUserInitiated.current = true;
    setStatusInternal(newStatus);
    setTriggerVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (hasMounted.current && !isUpdatingUrl.current) {
      updateUrl(false);
    }
  }, [status, updateUrl]);

  const setFromDate = useCallback((date: Date | null) => {
    if (date && formFilters?.executionDate) {
      toast.error('لا يمكن تحديد نطاق التاريخ وتاريخ التنفيذ معاً. يرجى إزالة تاريخ التنفيذ أولاً.');
      return;
    }
    isUserInitiated.current = true;
    setFromDateInternal(date);
    setTimePeriodInternal(''); 
  }, [formFilters?.executionDate]);

  useEffect(() => {
    if (hasMounted.current && !isUpdatingUrl.current) {
      updateUrl(false);
    }
  }, [fromDate, updateUrl]);

  const setToDate = useCallback((date: Date | null) => {
    if (date && formFilters?.executionDate) {
      toast.error('لا يمكن تحديد نطاق التاريخ وتاريخ التنفيذ معاً. يرجى إزالة تاريخ التنفيذ أولاً.');
      return;
    }
    isUserInitiated.current = true;
    setToDateInternal(date);
    setTimePeriodInternal('');
  }, [formFilters?.executionDate]);

  useEffect(() => {
    if (hasMounted.current && !isUpdatingUrl.current) {
      updateUrl(false);
    }
  }, [toDate, updateUrl]);

  const setTimePeriod = useCallback((period: TimePeriod) => {
    if (period && formFilters?.executionDate) {
      toast.error('لا يمكن تحديد نطاق التاريخ وتاريخ التنفيذ معاً. يرجى إزالة تاريخ التنفيذ أولاً.');
      return;
    }
    isUserInitiated.current = true;
    setTimePeriodInternal(period);

    if (period) {
      const range = calculateDateRangeFromPeriod(period);
      if (range) {
        setFromDateInternal(range.from);
        setToDateInternal(range.to);
      }
    }
  }, [formFilters?.executionDate]);

  useEffect(() => {
    if (hasMounted.current && !isUpdatingUrl.current) {
      updateUrl(false);
    }
  }, [timePeriod, updateUrl]);

  const clearTimePeriod = useCallback(() => {
    isUserInitiated.current = true;
    setTimePeriodInternal('');
    setFromDateInternal(null);
    setToDateInternal(null);
  }, []);

  const handleFilterFormChange = useCallback((data: OrderFiltersFormData) => {
    if (data.executionDate && (fromDate || toDate)) {
      toast.error('لا يمكن تحديد تاريخ التنفيذ ونطاق التاريخ معاً. يرجى إزالة نطاق التاريخ أولاً.');
      const { executionDate, ...restData } = data;
      setFormFilters(restData as OrderFiltersFormData);
      return;
    }
    setFormFilters(data);
  }, [fromDate, toDate]);

  useEffect(() => {
    if (hasMounted.current && !isUpdatingUrl.current && debouncedFormFilters !== null) {
      debouncedUpdateUrl();
    }
  }, [debouncedFormFilters, debouncedUpdateUrl]);

  useEffect(() => {
    if (debouncedFormFilters !== null) {
      isUserInitiated.current = true;
    }
  }, [debouncedFormFilters]);

  useEffect(() => {
    if (!hasMounted.current || !isUserInitiated.current) {
      return;
    }

    const fetchAndNavigate = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsNavigating(true);
      setIsEmpty(false);

      try {
        const filters = buildApiFilters(status, fromDate, toDate, debouncedFormFilters);
        const response = await fetchOrdersForSearch(filters);

        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (response.data && response.data.length > 0) {
          const firstOrderId = response.data[0].id;
          setTargetOrderId(firstOrderId);
          setIsEmpty(false);
        } else {
          setTargetOrderId(null);
          setIsEmpty(true);
        }
      } catch (error: any) {
        if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Failed to fetch orders for navigation:', error);
        setIsEmpty(true);
        setTargetOrderId(null);
      } finally {
        setIsNavigating(false);
        isUserInitiated.current = false;
      }
    };

    fetchAndNavigate();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [status, fromDate, toDate, debouncedFormFilters, triggerVersion, fetchOrdersForSearch]);

  return {
    status,
    setStatus,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    timePeriod,
    setTimePeriod,
    clearTimePeriod,

    targetOrderId,
    isNavigating,
    isEmpty,

    handleFilterFormChange,
  };
}
