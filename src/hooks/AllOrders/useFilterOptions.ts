import { useState, useEffect } from 'react';
import { getFilterOptions } from '@/lib/api/order';
import { FilterOptionsData } from '@/types/orders';

export function useFilterOptions() {
    const [options, setOptions] = useState<FilterOptionsData>({
        governorates: [],
        cities: [],
        areas: [],
        productNames: [],
        productSizes: [],
        productColors: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getFilterOptions();
                if (response.success && response.data) {
                    setOptions(response.data);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch filter options');
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    return { options, loading, error };
}

