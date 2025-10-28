import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { OrderFilters, OrderStatus, FilterOrdersDto } from '@/types/orders';
import { useOrdersStore } from '@/store/ordersStore';

export function useUnifiedFilters() {
    const { searchQuery, selectedStatus } = useOrdersStore();

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
    const limit = 10; // Server-side pagination

    // Debounced filters for API calls
    const [debouncedFilters, setDebouncedFilters] = useState<OrderFilters>(localFilters);
    const debounceTimerRef = useRef<NodeJS.Timeout>();

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
    }, [selectedStatus, searchQuery, debouncedFilters, page, limit]);

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
        setPage(1);
    }, []);

    const goToPage = useCallback((newPage: number) => {
        setPage(newPage);
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
    };
}

