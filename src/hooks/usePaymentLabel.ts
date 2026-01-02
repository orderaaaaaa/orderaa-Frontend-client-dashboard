'use client';

import { useMemo } from 'react';
import { usePaymentMethodsQuery, usePaymentStatusesQuery } from '@/services/lookups';

export function usePaymentMethodLabel() {
  const { data: paymentMethods, isLoading } = usePaymentMethodsQuery();

  const paymentMethodMap = useMemo(() => {
    if (!paymentMethods) return new Map<string, string>();
    return new Map(paymentMethods.map((pm) => [pm.key, pm.label]));
  }, [paymentMethods]);

  const getPaymentMethodLabel = (methodKey: string | null | undefined): string => {
    if (!methodKey) return '';
    return paymentMethodMap.get(methodKey) || methodKey;
  };

  return { getPaymentMethodLabel, isLoading, paymentMethods };
}

export function usePaymentStatusLabel() {
  const { data: paymentStatuses, isLoading } = usePaymentStatusesQuery();

  const paymentStatusMap = useMemo(() => {
    if (!paymentStatuses) return new Map<string, string>();
    return new Map(paymentStatuses.map((ps) => [ps.key, ps.label]));
  }, [paymentStatuses]);

  const getPaymentStatusLabel = (statusKey: string | null | undefined): string => {
    if (!statusKey) return '';
    return paymentStatusMap.get(statusKey) || statusKey;
  };

  return { getPaymentStatusLabel, isLoading, paymentStatuses };
}
