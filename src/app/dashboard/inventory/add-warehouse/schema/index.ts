import { z } from 'zod';

export const addWarehouseSchema = z
  .object({
    name: z.string().min(1, 'اسم المخزن مطلوب'),
    type: z.string().min(1, 'نوع المخزن مطلوب'),
    branch: z.string().min(1, 'فرع المخزن مطلوب'),
    parentWarehouseId: z.string().optional(),
    governorate: z.string().min(1, 'المحافظة مطلوبة'),
  })
  .refine(
    (data) => data.branch !== 'sub' || (data.parentWarehouseId && data.parentWarehouseId.length > 0),
    { message: 'المخزن الرئيسى مطلوب', path: ['parentWarehouseId'] },
  );

export type AddWarehouseFormData = z.infer<typeof addWarehouseSchema>;
