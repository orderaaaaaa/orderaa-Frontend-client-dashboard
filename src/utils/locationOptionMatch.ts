import type { LocationOption } from '@/types/locationOptions';
import { normalizeArabic } from '@/utils/arabicNormalize';

export const matchLocationOption = (
  options: LocationOption[] | undefined,
  stored: string | null | undefined,
): LocationOption | null => {
  const wanted = stored?.trim();
  if (!options || !wanted) return null;
  const normalizedWanted = normalizeArabic(wanted);
  return (
    options.find((option) => option.value === wanted) ??
    options.find((option) => option.label.trim() === wanted) ??
    options.find(
      (option) =>
        normalizeArabic(option.label) === normalizedWanted ||
        normalizeArabic(option.value) === normalizedWanted,
    ) ??
    null
  );
};
