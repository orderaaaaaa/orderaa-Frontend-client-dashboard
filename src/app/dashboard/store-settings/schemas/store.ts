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
      (files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= MAX_FILE_SIZE;
      },
      { message: 'حجم الصورة يجب أن يكون أقل من 5MB' }
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
      },
      { message: 'يرجى اختيار صورة بصيغة PNG أو JPG فقط' }
    ),

  language: z.enum(['ar', 'en']).default('ar'), // Add this line

  shippingPhoneNumber: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || (val.length >= 11 && val.length <= 13), {
      message: 'يجب أن يكون رقم الهاتف من 11 إلى 13 رقم',
    }),

  canOpenShipment: z.boolean().default(false),
  employeeCanEditContent: z.boolean().default(false),

  defaultShipmentContent: z.string().optional(),
  defaultReturnShippingCost: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().optional()
  ),

  autoCancelAttempts: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().optional()
  ),
});

export type OrderSettingsFormData = z.infer<typeof orderSettingsSchema>;
