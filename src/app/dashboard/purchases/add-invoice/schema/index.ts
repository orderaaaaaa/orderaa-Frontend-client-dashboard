import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
  'image/tiff',
  'image/heic',
  'image/heif',
];

const invoiceItemSchema = z.object({
  id: z.string(),
  productId: z.number(),
  name: z.string().min(1, 'اسم الصنف مطلوب'),
  count: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return Number(val);
    },
    z
      .number({ required_error: 'الكمية مطلوبة', invalid_type_error: 'الكمية مطلوبة' })
      .min(1, 'الكمية يجب ان تكون اكبر من 0'),
  ),
  unitPrice: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0, 'السعر يجب ان يكون 0 او اكبر'),
  ),
  total: z.number(),
  piecesPerPackage: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0).optional(),
  ),
  piecePrice: z.number().optional(),
  variants: z
    .array(
      z.object({
        attribute: z.string(),
        option: z.string(),
        attributeOptionId: z.number().optional(),
      }),
    )
    .optional(),
});

export const addInvoiceSchema = z.object({
  invoiceType: z.enum(['PURCHASE', 'RETURN'], {
    required_error: 'نوع الفاتورة مطلوب',
    invalid_type_error: 'نوع الفاتورة مطلوب',
  }),
  supplierId: z
    .number({ required_error: 'المورد مطلوب', invalid_type_error: 'المورد مطلوب' })
    .min(1, 'المورد مطلوب'),
  createdByEmployeeId: z.number().optional(),
  paymentAmount: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).optional(),
  ),
  externalInvoiceNumber: z.string().optional(),
  items: z
    .array(invoiceItemSchema)
    .min(1, 'يجب اضافة صنف واحد على الاقل'),
  invoiceImage: z
    .any()
    .optional()
    .refine(
      (value) => {
        if (!value || (value instanceof FileList && value.length === 0))
          return true;
        const file = value instanceof FileList ? value[0] : value;
        return file?.size <= MAX_FILE_SIZE;
      },
      { message: 'حجم الصورة يجب أن يكون أقل من 5MB' },
    )
    .refine(
      (value) => {
        if (!value || (value instanceof FileList && value.length === 0))
          return true;
        const file = value instanceof FileList ? value[0] : value;
        return ACCEPTED_IMAGE_TYPES.includes(file?.type);
      },
      { message: 'صيغة الملف غير مدعومة، يرجى اختيار صورة' },
    ),
});

export type AddInvoiceFormData = z.infer<typeof addInvoiceSchema>;
