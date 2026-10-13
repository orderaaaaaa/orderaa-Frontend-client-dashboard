export const ATTRIBUTE_LIST_SEPARATOR = '، ';

export function missingAttributesOf(
  attributes: readonly string[],
  chosenAttributes: readonly string[]
): string[] {
  const chosen = new Set(chosenAttributes);
  return attributes.filter((attribute) => !chosen.has(attribute));
}

export function missingAttributesMessage(missing: readonly string[]): string {
  return `لازم تختار: ${missing.join(ATTRIBUTE_LIST_SEPARATOR)}`;
}
