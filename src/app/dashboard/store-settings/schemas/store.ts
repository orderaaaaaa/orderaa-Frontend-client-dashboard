import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const orderSettingsSchema = z.object({
  logo: z
    .any()
    .optional()
    .refine(
      (value) => {
        if (!value || typeof value === 'string') return true;
        if (value.length === 0) return true;
        return value[0]?.size <= MAX_FILE_SIZE;
      },
      { message: 'حجم الصورة يجب أن يكون أقل من 5MB' }
    )
    .refine(
      (value) => {
        if (!value || typeof value === 'string') return true;
        if (value.length === 0) return true;
        return ACCEPTED_IMAGE_TYPES.includes(value[0]?.type);
      },
      { message: 'يرجى اختيار صورة بصيغة PNG أو JPG فقط' }
    ),

  language: z.enum(['ar', 'en']).optional(),
  cancellationReasons: z.array(z.string()).optional(),
  utmSources: z.array(z.string()).optional(),
  pageNames: z.array(z.string()).optional(),
  shippingPhoneNumber: z.string().trim().optional(),

  canOpenShipment: z.boolean().optional(),
  employeeCanEditContent: z.boolean().optional(),

  defaultShipmentContent: z.string().optional(),
  defaultReturnShippingCost: z.preprocess(
    (val) =>
      val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().optional()
  ),

  autoCancelAttempts: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = Number(val);
    if (isNaN(num)) return undefined;
    return num < 0 ? 0 : num;
  }, z.number().optional()),

  url: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'يرجى إدخال رابط صحيح' }
    ),

  reservationType: z.enum(['ON_CREATION', 'ON_CONFIRMED']).optional(),
  allowNegativeReservation: z.boolean().optional(),
  minStockLevel: z.number().int().min(0).nullable().optional(),
  maxStockLevel: z.number().int().min(0).nullable().optional(),
});

export type OrderSettingsFormData = z.infer<typeof orderSettingsSchema>;
