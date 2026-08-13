import { z } from 'zod';

export const WAREHOUSE_BRANCH = {
  MAIN: 'main',
  SUB: 'sub',
} as const;

export const warehouseFormSchema = z
  .object({
    name: z.string().min(1, 'اسم المخزن مطلوب'),
    branch: z.enum(['main', 'sub'], { message: 'فرع المخزن مطلوب' }),
    parentWarehouseId: z.string().optional(),
    address: z.string().optional(),
    isDefault: z.boolean(),
    isActive: z.boolean(),
    countsAsAvailable: z.boolean(),
  })
  .refine(
    (data) =>
      data.branch !== WAREHOUSE_BRANCH.SUB ||
      (data.parentWarehouseId != null && data.parentWarehouseId.length > 0),
    { message: 'المخزن الرئيسي مطلوب', path: ['parentWarehouseId'] }
  );

export type WarehouseFormData = z.infer<typeof warehouseFormSchema>;
