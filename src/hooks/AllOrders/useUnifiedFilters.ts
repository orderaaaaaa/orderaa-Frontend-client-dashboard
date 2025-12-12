import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { OrderFilters, OrderStatus, FilterOrdersDto } from '@/types/orders';
import { useOrdersStore } from '@/store/ordersStore';

// Helper to format date to ISO string
const formatDateToISO = (date: Date): string => {
    return date.toISOString();
};

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
    });

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Debounced filters for API calls
    const [debouncedFilters, setDebouncedFilters] = useState<OrderFilters>(localFilters);
    const debounceTimerRef = useRef<NodeJS.Timeout>();

    // Date range setters - clear executionDate when date range is set
    const setFromDate = useCallback((date: Date | null) => {
        setFromDateInternal(date);
        if (date) {
            setLocalFilters(prev => ({ ...prev, executionDate: '' }));
        }
    }, []);

    const setToDate = useCallback((date: Date | null) => {
        setToDateInternal(date);
        if (date) {
            setLocalFilters(prev => ({ ...prev, executionDate: '' }));
        }
    }, []);

    // Debounce filter changes
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            setDebouncedFilters(localFilters);
            setPage(1); // Reset to page 1 on filter change
        }, 500); // 500ms debounce

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [localFilters]);

    // Clear date range when executionDate is set
    useEffect(() => {
        if (localFilters.executionDate) {
            setFromDateInternal(null);
            setToDateInternal(null);
        }
    }, [localFilters.executionDate]);

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

        // Date range and confirmedDate are mutually exclusive
        // If confirmedDate (executionDate) is set, use that; otherwise use date range
        if (debouncedFilters.executionDate) {
            filters.confirmedDate = debouncedFilters.executionDate;
        } else {
            if (fromDate) filters.createdAfter = formatDateToISO(fromDate);
            if (toDate) filters.createdBefore = formatDateToISO(toDate);
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

        return filters;
    }, [selectedStatus, searchQuery, debouncedFilters, fromDate, toDate, page, limit]);

    const updateLocalFilters = useCallback((newFilters: Partial<OrderFilters>) => {
        setLocalFilters((prev) => ({ ...prev, ...newFilters }));
        // Note: Page reset happens in the debounce effect
    }, []);

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

