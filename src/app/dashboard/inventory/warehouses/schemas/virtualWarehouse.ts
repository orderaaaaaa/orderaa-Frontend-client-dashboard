import { z } from 'zod';
import { OrderStatus } from '@/types/orders';
import {
  VIRTUAL_WAREHOUSE_TERM_KINDS,
  type VirtualWarehousePreset,
  type VirtualWarehouseTermInput,
  type VirtualWarehouseTermView,
} from '@/lib/api/virtualWarehouses';
import { WORKFLOW_ORDER_STATUSES } from '../constants';
import { expandRange } from '../utils/ruleMatching';

export const MAX_VIRTUAL_WAREHOUSE_TERMS = 20;

export const virtualWarehouseTermSchema = z
  .object({
    sign: z.union([z.literal(1), z.literal(-1)]),
    kind: z.enum([
      VIRTUAL_WAREHOUSE_TERM_KINDS.WAREHOUSE,
      VIRTUAL_WAREHOUSE_TERM_KINDS.STATUS_RANGE,
    ]),
    warehouseId: z.string(),
    warehouseName: z.string().optional(),
    savedWarehouseId: z.string().optional(),
    rangeStart: z.nativeEnum(OrderStatus).optional(),
    rangeEnd: z.nativeEnum(OrderStatus).optional(),
    excludedStatuses: z.array(z.nativeEnum(OrderStatus)),
  })
  .superRefine((term, ctx) => {
    if (term.kind === VIRTUAL_WAREHOUSE_TERM_KINDS.WAREHOUSE) {
      if (!term.warehouseId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'اختر المخزن',
          path: ['warehouseId'],
        });
      }
      return;
    }

    if (!term.rangeStart || !term.rangeEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'اختر بداية ونهاية النطاق',
        path: ['rangeStart'],
      });
      return;
    }

    const startIndex = WORKFLOW_ORDER_STATUSES.indexOf(term.rangeStart);
    const endIndex = WORKFLOW_ORDER_STATUSES.indexOf(term.rangeEnd);
    if (startIndex > endIndex) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'بداية النطاق بعد نهايته',
        path: ['rangeStart'],
      });
      return;
    }

    const range = expandRange(term.rangeStart, term.rangeEnd);
    if (term.excludedStatuses.some((status) => !range.includes(status))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'الحالات المستثناة يجب أن تكون داخل النطاق',
        path: ['excludedStatuses'],
      });
    }
  });

export const virtualWarehouseTermsSchema = z
  .array(virtualWarehouseTermSchema)
  .min(1, 'أضف بندًا واحدًا على الأقل')
  .max(MAX_VIRTUAL_WAREHOUSE_TERMS, 'الحد الأقصى 20 بندًا')
  .superRefine((terms, ctx) => {
    const seen = new Set<string>();
    terms.forEach((term, index) => {
      if (term.kind !== VIRTUAL_WAREHOUSE_TERM_KINDS.WAREHOUSE) return;
      if (!term.warehouseId) return;
      if (seen.has(term.warehouseId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'هذا المخزن مستخدم في بند آخر',
          path: [index, 'warehouseId'],
        });
      }
      seen.add(term.warehouseId);
    });
  });

export const virtualWarehouseFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'اسم المخزن الافتراضي مطلوب')
    .max(191, 'الاسم طويل جدًا'),
  isActive: z.boolean(),
  terms: virtualWarehouseTermsSchema,
});

export type VirtualWarehouseTermFormData = z.infer<
  typeof virtualWarehouseTermSchema
>;
export type VirtualWarehouseFormData = z.infer<
  typeof virtualWarehouseFormSchema
>;

export const emptyWarehouseTerm = (): VirtualWarehouseTermFormData => ({
  sign: 1,
  kind: VIRTUAL_WAREHOUSE_TERM_KINDS.WAREHOUSE,
  warehouseId: '',
  excludedStatuses: [],
});

export const emptyVirtualWarehouseForm = (): VirtualWarehouseFormData => ({
  name: '',
  isActive: true,
  terms: [emptyWarehouseTerm()],
});

type TermSource = Pick<
  VirtualWarehouseTermView,
  'sign' | 'kind' | 'warehouseId' | 'rangeStart' | 'rangeEnd' | 'excludedStatuses'
> & { warehouseName?: string };

export const termToFormData = (
  term: TermSource
): VirtualWarehouseTermFormData => ({
  sign: term.sign,
  kind: term.kind,
  warehouseId: term.warehouseId === null ? '' : String(term.warehouseId),
  warehouseName: term.warehouseName,
  savedWarehouseId:
    term.warehouseId === null ? undefined : String(term.warehouseId),
  rangeStart: term.rangeStart ?? undefined,
  rangeEnd: term.rangeEnd ?? undefined,
  excludedStatuses: term.excludedStatuses ?? [],
});

export const presetToFormTerms = (
  preset: VirtualWarehousePreset
): VirtualWarehouseTermFormData[] => preset.terms.map(termToFormData);

export const savedWarehouseRef = (
  term: VirtualWarehouseTermFormData
): { id: number; name: string } | null =>
  term.warehouseId &&
  term.warehouseName &&
  term.warehouseId === term.savedWarehouseId
    ? { id: Number(term.warehouseId), name: term.warehouseName }
    : null;

export const formTermToInput = (
  term: VirtualWarehouseTermFormData
): VirtualWarehouseTermInput =>
  term.kind === VIRTUAL_WAREHOUSE_TERM_KINDS.WAREHOUSE
    ? { sign: term.sign, kind: term.kind, warehouseId: Number(term.warehouseId) }
    : {
        sign: term.sign,
        kind: term.kind,
        rangeStart: term.rangeStart,
        rangeEnd: term.rangeEnd,
        excludedStatuses: term.excludedStatuses,
      };
