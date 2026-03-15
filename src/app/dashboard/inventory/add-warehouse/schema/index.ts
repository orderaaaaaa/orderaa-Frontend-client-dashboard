import { z } from 'zod';

export const addWarehouseSchema = z.object({
  name: z.string().min(1, 'اسم المخزن مطلوب'),
  type: z.string().min(1, 'نوع المخزن مطلوب'),
  branch: z.string().min(1, 'فرع المخزن مطلوب'),
  governorate: z.string().min(1, 'المحافظة مطلوبة'),
});

export type AddWarehouseFormData = z.infer<typeof addWarehouseSchema>;
