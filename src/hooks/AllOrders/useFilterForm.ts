import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import {
    orderFiltersSchema,
    OrderFiltersFormData,
    defaultFilterValues,
} from '@/schemas/orderFilters.schema';

interface UseFilterFormProps {
    onSubmit?: (data: OrderFiltersFormData) => void;
    defaultValues?: Partial<OrderFiltersFormData>;
}

/**
 * Custom hook for managing filter form with React Hook Form and Zod validation
 *
 * @param onSubmit - Callback function when form is submitted
 * @param defaultValues - Initial values for the form
 * @returns Form methods and state from React Hook Form
 *
 * @example
 * ```tsx
 * const { register, control, handleSubmit, formState } = useFilterForm({
 *   onSubmit: (data) => console.log(data)
 * });
 * ```
 */
export function useFilterForm({
    onSubmit,
    defaultValues: providedDefaults,
}: UseFilterFormProps = {}): UseFormReturn<OrderFiltersFormData> {
    const form = useForm<OrderFiltersFormData>({
        resolver: zodResolver(orderFiltersSchema),
        defaultValues: {
            ...defaultFilterValues,
            ...providedDefaults,
        },
        mode: 'onChange', // Validate on change for better UX
        reValidateMode: 'onChange',
    });

    const { watch } = form;
    const onSubmitRef = useRef(onSubmit);

    // Update ref when onSubmit changes
    useEffect(() => {
        onSubmitRef.current = onSubmit;
    }, [onSubmit]);

    // Watch all form values for real-time updates
    useEffect(() => {
        const subscription = watch((value) => {
            if (onSubmitRef.current) {
                onSubmitRef.current(value as OrderFiltersFormData);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    return form;
}

/**
 * Helper type for form field names
 */
export type FilterFormFieldName = keyof OrderFiltersFormData;

