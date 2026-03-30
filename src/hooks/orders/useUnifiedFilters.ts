import { useState, useCallback, useMemo, useEffect } from 'react';
import { OrderFilters, FilterOrdersDto } from '@/types/orders';
import { useOrdersStore } from '@/store/ordersStore';
import { useDebounce } from '@/utils/debounce';
import { formatLocalStartOfDay, formatLocalEndOfDay } from '@/utils/dateRangeUtils';
import { toast } from 'react-toastify';
import { UrlFilterState } from '@/utils/urlFilters';

// Helper function to build API filters from URL filter state
export function buildApiFiltersFromUrlState(urlFilters: UrlFilterState): FilterOrdersDto {
    const filters: FilterOrdersDto = {
        page: urlFilters.page,
        limit: urlFilters.limit,
    };

    // Add status
    if (urlFilters.status) {
        filters.status = urlFilters.status;
    }

    // Add search
    if (urlFilters.search) {
        filters.search = urlFilters.search;
    }

    // Date range and executionDate are mutually exclusive
    if (urlFilters.localFilters.executionDate) {
        filters.executionDate = urlFilters.localFilters.executionDate;
    } else {
        // Always set both dates if either is present for consistent filtering
        if (urlFilters.fromDate) {
            filters.createdAfter = formatLocalStartOfDay(urlFilters.fromDate);
        }
        if (urlFilters.toDate) {
            filters.createdBefore = formatLocalEndOfDay(urlFilters.toDate);
        }
    }

    // Add local filters
    const { localFilters } = urlFilters;

    if (localFilters.customerName) {
        filters.customerName = localFilters.customerName;
    }
    if (localFilters.phone) {
        filters.customerPhone = localFilters.phone;
    }
    if (localFilters.governorate) {
        filters.governorate = localFilters.governorate;
    }
    if (localFilters.city) {
        filters.city = localFilters.city;
    }
    if (localFilters.area) {
        filters.area = localFilters.area;
    }
    if (localFilters.productName) {
        filters.productName = localFilters.productName;
    }
    if (localFilters.shipmentCode) {
        filters.code = localFilters.shipmentCode;
    }
    if (localFilters.newFirst !== undefined) {
        filters.newFirst = localFilters.newFirst;
    }
    if (localFilters.orderByDirection) {
        filters.orderByDirection = localFilters.orderByDirection;
    }
    if (localFilters.productId) {
        filters.productId = localFilters.productId;
    }
    if (localFilters.storeId) {
        filters.storeId = Number(localFilters.storeId);
    }
    if (localFilters.cancellationReasons?.length) {
        filters.cancelReasonId = localFilters.cancellationReasons;
    }

    return filters;
}

export function useUnifiedFilters() {
    const { searchQuery, selectedStatus } = useOrdersStore();

    // Date range state (mutually exclusive with executionDate)
    const [fromDate, setFromDateInternal] = useState<Date | null>(null);
    const [toDate, setToDateInternal] = useState<Date | null>(null);

    // Local filters from FilterSection
    const [localFilters, setLocalFilters] = useState<OrderFilters>({
        productName: '',
        sizeColor: '',
        governorate: '',
        city: '',
        area: '',
        shipmentCode: '',
        customerName: '',
        phone: '',
        address: '',
        executionDate: '',
        productId: '',
        storeId: '',
        cancellationReasons: [],
    });

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Debounced filters for API calls using utility hook
    const debouncedFilters = useDebounce(localFilters, 500);

    // Date range setters - block if executionDate is set
    const setFromDate = useCallback((date: Date | null) => {
        if (date && localFilters.executionDate) {
            toast.error('لا يمكن تحديد نطاق التاريخ وتاريخ التنفيذ معاً. يرجى إزالة تاريخ التنفيذ أولاً.');
            return;
        }
        setFromDateInternal(date);
    }, [localFilters.executionDate]);

    const setToDate = useCallback((date: Date | null) => {
        if (date && localFilters.executionDate) {
            toast.error('لا يمكن تحديد نطاق التاريخ وتاريخ التنفيذ معاً. يرجى إزالة تاريخ التنفيذ أولاً.');
            return;
        }
        setToDateInternal(date);
    }, [localFilters.executionDate]);

    // Reset to page 1 when debounced filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedFilters]);

    // Build unified filter object for API using debounced filters
    const apiFilters = useMemo((): FilterOrdersDto => {
        const filters: FilterOrdersDto = {
            page,
            limit,
        };

        // Add status from store
        if (selectedStatus) {
            filters.status = selectedStatus;
        }

        // Add search from store
        if (searchQuery) {
            filters.search = searchQuery;
        }

        // Date range and executionDate are mutually exclusive
        // If executionDate (executionDate) is set, use that; otherwise use date range
        if (debouncedFilters.executionDate) {
            filters.executionDate = debouncedFilters.executionDate;
        } else {
            if (fromDate) filters.createdAfter = formatLocalStartOfDay(fromDate);
            if (toDate) filters.createdBefore = formatLocalEndOfDay(toDate);
        }

        // Add debounced local filters
        if (debouncedFilters.customerName) {
            filters.customerName = debouncedFilters.customerName;
        }

        if (debouncedFilters.phone) {
            filters.customerPhone = debouncedFilters.phone;
        }

        if (debouncedFilters.governorate) {
            filters.governorate = debouncedFilters.governorate;
        }

        if (debouncedFilters.city) {
            filters.city = debouncedFilters.city;
        }

        if (debouncedFilters.area) {
            filters.area = debouncedFilters.area;
        }

        if (debouncedFilters.productName) {
            filters.productName = debouncedFilters.productName;
        }

        if (debouncedFilters.shipmentCode) {
            filters.code = debouncedFilters.shipmentCode;
        }

        if (debouncedFilters.productId) {
            filters.productId = debouncedFilters.productId;
        }

        if (debouncedFilters.cancellationReasons?.length) {
            filters.cancelReasonId = debouncedFilters.cancellationReasons;
        }

        return filters;
    }, [selectedStatus, searchQuery, debouncedFilters, fromDate, toDate, page, limit]);

    const updateLocalFilters = useCallback((newFilters: Partial<OrderFilters>) => {
        // Block executionDate if date range is set
        if (newFilters.executionDate && (fromDate || toDate)) {
            toast.error('لا يمكن تحديد تاريخ التنفيذ ونطاق التاريخ معاً. يرجى إزالة نطاق التاريخ أولاً.');
            // Remove executionDate from the update
            const { executionDate, ...restFilters } = newFilters;
            if (Object.keys(restFilters).length > 0) {
                setLocalFilters((prev) => ({ ...prev, ...restFilters }));
            }
            return;
        }
        setLocalFilters((prev) => ({ ...prev, ...newFilters }));
        // Note: Page reset happens in the debounce effect
    }, [fromDate, toDate]);

    const resetFilters = useCallback(() => {
        setLocalFilters({
            productName: '',
            sizeColor: '',
            governorate: '',
            city: '',
            area: '',
            shipmentCode: '',
            customerName: '',
            phone: '',
            address: '',
            executionDate: '',
            productId: '',
            cancellationReasons: [],
        });
        setFromDateInternal(null);
        setToDateInternal(null);
        setPage(1);
    }, []);

    const goToPage = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const updateLimit = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    }, []);

    return {
        apiFilters,
        localFilters,
        updateLocalFilters,
        resetFilters,
        page,
        setPage,
        goToPage,
        limit,
        updateLimit,
        // Date range state and setters
        fromDate,
        setFromDate,
        toDate,
        setToDate,
    };
}

