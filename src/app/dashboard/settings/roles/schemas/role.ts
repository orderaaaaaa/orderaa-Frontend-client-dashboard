import { z } from 'zod';

/** Mirrors `CreateRoleDto` validation in orderaa-backend (name required, ≤100). */
export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'اسم الدور مطلوب')
    .max(100, 'اسم الدور يجب ألا يتجاوز 100 حرف'),
  description: z.string().trim().max(255, 'الوصف طويل جدًا').optional(),
});

export type RoleFormData = z.infer<typeof roleFormSchema>;
