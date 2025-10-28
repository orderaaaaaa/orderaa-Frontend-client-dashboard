import { useState, useEffect } from 'react';
import { getOrderStatistics } from '@/lib/api/order';
import { OrderStatistics } from '@/types/orders';

export function useOrderStatistics() {
    const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getOrderStatistics();
            if (response.success && response.data) {
                setStatistics(response.data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, []);

    return { statistics, loading, error, refetch };
}

