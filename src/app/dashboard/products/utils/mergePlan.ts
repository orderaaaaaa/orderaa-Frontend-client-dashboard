import {
  MERGE_PLAN_ERROR_CODE,
  MERGE_PLAN_ISSUE_CODES,
  type MergeJobError,
  type MergePlanErrorBody,
  type MergePlanIssue,
  type MergeVariantPlanEntry,
  type ProductDetail,
  type ProductDetailVariant,
} from '../types/products';
import {
  isVariantDeleteBlocker,
  VARIANT_DELETE_REASON_LABELS,
} from './productApiError';

export interface MergeVariantRef {
  variant: ProductDetailVariant;
  productId: number;
  productName: string;
  isTarget: boolean;
}

export type MergePlanOverrides = Record<number, MergeVariantPlanEntry>;

const ARABIC_FOLD: Record<string, string> = {
  'أ': 'ا',
  'إ': 'ا',
  'آ': 'ا',
  'ة': 'ه',
  'ى': 'ي',
};

const normalizeLabel = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآةى]/g, (char) => ARABIC_FOLD[char] ?? char)
    .replace(/\s+/g, ' ');

export const variantLabelKey = (variant: ProductDetailVariant) =>
  variant.labels
    .map(
      (label) =>
        `${normalizeLabel(label.attribute)}=${normalizeLabel(label.option)}`,
    )
    .sort()
    .join('|');

export const variantDisplayLabel = (variant: ProductDetailVariant) => {
  const options = variant.labels.map((label) => label.option).join(' / ');
  return options || 'المتغير الأساسي';
};

export const variantFullLabel = (ref: MergeVariantRef) =>
  `${variantDisplayLabel(ref.variant)} (${ref.productName})`;

export const collectMergeVariants = (
  target: ProductDetail,
  sources: ProductDetail[],
): MergeVariantRef[] => [
  ...target.variants.map((variant) => ({
    variant,
    productId: target.id,
    productName: target.name,
    isTarget: true,
  })),
  ...sources.flatMap((source) =>
    source.variants.map((variant) => ({
      variant,
      productId: source.id,
      productName: source.name,
      isTarget: false,
    })),
  ),
];

export const defaultMergePlan = (
  refs: MergeVariantRef[],
): Map<number, MergeVariantPlanEntry> => {
  const plan = new Map<number, MergeVariantPlanEntry>();
  const keptByKey = new Map<string, number>();
  refs.forEach(({ variant, isTarget }) => {
    const key = variantLabelKey(variant);
    const keptId = keptByKey.get(key);
    if (isTarget || keptId === undefined) {
      plan.set(variant.id, { variantId: variant.id, action: 'KEEP' });
      if (keptId === undefined) keptByKey.set(key, variant.id);
      return;
    }
    plan.set(variant.id, {
      variantId: variant.id,
      action: 'MERGE_INTO',
      intoVariantId: keptId,
    });
  });
  return plan;
};

export const resolveMergePlan = (
  refs: MergeVariantRef[],
  overrides: MergePlanOverrides,
): Map<number, MergeVariantPlanEntry> => {
  const defaults = defaultMergePlan(refs);
  const chosen = new Map<number, MergeVariantPlanEntry>();
  refs.forEach(({ variant }) => {
    const entry = overrides[variant.id] ?? defaults.get(variant.id);
    if (entry) chosen.set(variant.id, entry);
  });
  const kept = new Set(
    Array.from(chosen.values())
      .filter((entry) => entry.action === 'KEEP')
      .map((entry) => entry.variantId),
  );
  const resolved = new Map<number, MergeVariantPlanEntry>();
  chosen.forEach((entry, variantId) => {
    if (entry.action === 'MERGE_INTO') {
      const into = entry.intoVariantId;
      if (into === undefined || into === variantId || !kept.has(into)) {
        resolved.set(variantId, { variantId, action: 'KEEP' });
        return;
      }
      resolved.set(variantId, {
        variantId,
        action: 'MERGE_INTO',
        intoVariantId: into,
      });
      return;
    }
    if (entry.action === 'DROP') {
      resolved.set(
        variantId,
        entry.confirmStoreLink
          ? { variantId, action: 'DROP', confirmStoreLink: true }
          : { variantId, action: 'DROP' },
      );
      return;
    }
    resolved.set(variantId, { variantId, action: 'KEEP' });
  });
  return resolved;
};

export const keptCollisions = (
  refs: MergeVariantRef[],
  plan: Map<number, MergeVariantPlanEntry>,
): number[][] => {
  const groups = new Map<string, { ids: number[]; moved: boolean }>();
  refs.forEach(({ variant, isTarget }) => {
    if (plan.get(variant.id)?.action !== 'KEEP') return;
    const key = variantLabelKey(variant);
    const group = groups.get(key) ?? { ids: [], moved: false };
    group.ids.push(variant.id);
    group.moved = group.moved || !isTarget;
    groups.set(key, group);
  });
  return Array.from(groups.values())
    .filter((group) => group.ids.length > 1 && group.moved)
    .map((group) => group.ids);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isIssueCode = (value: unknown): value is MergePlanIssue['code'] =>
  typeof value === 'string' &&
  (MERGE_PLAN_ISSUE_CODES as readonly string[]).includes(value);

const toIssues = (value: unknown): MergePlanIssue[] =>
  Array.isArray(value)
    ? value.filter(
        (issue): issue is MergePlanIssue =>
          isRecord(issue) && isIssueCode(issue.code),
      )
    : [];

export function mergePlanErrorBody(error: unknown): MergePlanErrorBody | null {
  const data = (error as { response?: { status?: number; data?: unknown } })
    ?.response?.data;
  if (!isRecord(data) || data.code !== MERGE_PLAN_ERROR_CODE) return null;
  const details = isRecord(data.details) ? data.details : {};
  return {
    code: MERGE_PLAN_ERROR_CODE,
    message: typeof data.message === 'string' ? data.message : '',
    details: { issues: toIssues(details.issues) },
  };
}

export function parseMergeJobError(raw: string | undefined): MergeJobError | null {
  if (!raw || !raw.trimStart().startsWith('{')) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.code !== MERGE_PLAN_ERROR_CODE) return null;
    return { code: MERGE_PLAN_ERROR_CODE, issues: toIssues(parsed.issues) };
  } catch {
    return null;
  }
}

const reasonLabel = (reason: string | undefined) =>
  isVariantDeleteBlocker(reason)
    ? VARIANT_DELETE_REASON_LABELS[reason]
    : 'مستخدم';

export function describeMergeIssue(
  issue: MergePlanIssue,
  labelOf: (variantId: number) => string,
): string {
  const into =
    issue.intoVariantId !== undefined && issue.intoVariantId !== null
      ? labelOf(issue.intoVariantId)
      : null;
  switch (issue.code) {
    case 'MERGE_PLAN_INCOMPLETE':
      return 'متغير جديد أضيف بعد فتح النافذة، راجع ترتيبه ثم أعد المحاولة';
    case 'MERGE_PLAN_DUPLICATE':
      return 'هذا المتغير مذكور أكثر من مرة';
    case 'MERGE_PLAN_FOREIGN_VARIANT':
      return 'هذا المتغير لم يعد ضمن المنتجات المدمجة';
    case 'MERGE_PLAN_INVALID_ENTRY':
      return 'إجراء غير صالح لهذا المتغير';
    case 'MERGE_PLAN_NOTHING_KEPT':
      return 'يجب إبقاء متغير واحد على الأقل في المنتج الرئيسي';
    case 'MERGE_INTO_NOT_KEPT':
      return into
        ? `لا يمكن الدمج مع ${into} لأنه لن يبقى في المنتج الرئيسي`
        : 'اختر متغيراً باقياً للدمج معه';
    case 'VARIANT_IN_USE':
      return `لا يمكن حذفه لأنه ${reasonLabel(issue.reason)}، ادمجه مع متغير آخر بدلاً من ذلك`;
    case 'VARIANT_STORE_LINK_CONFIRMATION_REQUIRED':
      return 'مرتبط بمتجرك، اختر «حذف» مرة أخرى وأكّد الحذف';
    case 'VARIANT_COMBINATION_TAKEN': {
      const others = (issue.variantIds ?? [])
        .filter((id) => id !== issue.variantId)
        .map(labelOf);
      return others.length > 0
        ? `له نفس قيم ${others.join('، ')} بعد الدمج، ادمج أحدهما في الآخر أو احذفه`
        : 'متغيران بنفس القيم بعد الدمج، ادمج أحدهما في الآخر أو احذفه';
    }
    case 'MERGE_PLAN_RESULT_MISMATCH':
      return 'تعذر تطبيق الترتيب، لم يتم تغيير أي شيء. حاول مرة أخرى';
  }
}
