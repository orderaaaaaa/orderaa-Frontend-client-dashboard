import { z } from 'zod';

/**
 * Zod validation schema for order filters
 * Defines validation rules for all filter fields
 */
export const orderFiltersSchema = z.object({
    // Text fields - optional strings with trimming
    shipmentCode: z
        .string()
        .trim()
        .max(50, 'كود الشحنة يجب أن يكون أقل من 50 حرف')
        .optional()
        .or(z.literal('')),

    customerName: z
        .string()
        .trim()
        .max(100, 'اسم العميل يجب أن يكون أقل من 100 حرف')
        .optional()
        .or(z.literal('')),

    phone: z
        .string()
        .trim()
        .regex(/^[0-9+\s-]*$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط')
        .max(20, 'رقم الهاتف يجب أن يكون أقل من 20 رقم')
        .optional()
        .or(z.literal('')),

    address: z
        .string()
        .trim()
        .max(200, 'العنوان يجب أن يكون أقل من 200 حرف')
        .optional()
        .or(z.literal('')),

    // Date field
    executionDate: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (date) => {
                if (!date) return true;
                const parsedDate = new Date(date);
                return !isNaN(parsedDate.getTime());
            },
            { message: 'تاريخ غير صحيح' }
        ),

    // Dropdown fields - optional strings
    governorate: z.string().optional().or(z.literal('')),

    city: z.string().optional().or(z.literal('')),

    area: z.string().optional().or(z.literal('')),

    sizeColor: z.string().optional().or(z.literal('')),

    productId: z.string().optional().or(z.literal('')),

    cancellationReasons: z.array(z.string()).optional(),

    storeId: z.string().optional().or(z.literal('')),

    shippingCompany: z.string().optional().or(z.literal('')),

    // Sorting fields
    skipFilters: z.boolean().optional(),

    orderByDirection: z.enum(['asc', 'desc']).optional().or(z.literal('')),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type OrderFiltersFormData = z.infer<typeof orderFiltersSchema>;

/**
 * Default values for the form
 */
export const defaultFilterValues: OrderFiltersFormData = {
    shipmentCode: '',
    customerName: '',
    phone: '',
    address: '',
    executionDate: '',
    governorate: '',
    city: '',
    area: '',
    sizeColor: '',
    productId: '',
    cancellationReasons: [],
    storeId: '',
    shippingCompany: '',
    skipFilters: undefined,
    orderByDirection: '',
};

