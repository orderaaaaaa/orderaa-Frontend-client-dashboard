export const ATTRIBUTE_LIST_SEPARATOR = '، ';

export function missingAttributesOf(
  attributes: readonly string[],
  chosenAttributes: readonly string[]
): string[] {
  const chosen = new Set(chosenAttributes);
  return attributes.filter((attribute) => !chosen.has(attribute));
}

export interface CatalogAttributeOptions {
  attribute: string;
  options: readonly { name: string }[];
}

export function chosenCatalogValues(
  catalog: readonly CatalogAttributeOptions[],
  values: Readonly<Record<string, string>>
): Record<string, string> {
  return Object.fromEntries(
    catalog
      .filter((group) =>
        group.options.some((option) => option.name === values[group.attribute])
      )
      .map((group) => [group.attribute, values[group.attribute]])
  );
}

export function missingCatalogAttributesOf(
  catalog: readonly CatalogAttributeOptions[],
  values: Readonly<Record<string, string>>
): string[] {
  return missingAttributesOf(
    catalog.map((group) => group.attribute),
    Object.keys(chosenCatalogValues(catalog, values))
  );
}

export function attributesWithoutSingleOption(
  catalog: readonly { attribute: string; options: readonly { id: number }[] }[],
  attributeOptionIds: readonly number[]
): string[] {
  return catalog
    .filter(
      (group) =>
        attributeOptionIds.filter((id) =>
          group.options.some((option) => option.id === id)
        ).length !== 1
    )
    .map((group) => group.attribute);
}

export interface IncompleteVariantLine {
  productName: string;
  missing: readonly string[];
}

export function incompleteLinesMessage(
  lines: readonly IncompleteVariantLine[]
): string {
  const entries = lines.map(
    (line) => `${line.productName} (${line.missing.join(ATTRIBUTE_LIST_SEPARATOR)})`
  );
  return `لازم تكمّل خيارات: ${entries.join(ATTRIBUTE_LIST_SEPARATOR)}`;
}

export function missingAttributesMessage(missing: readonly string[]): string {
  return `لازم تختار: ${missing.join(ATTRIBUTE_LIST_SEPARATOR)}`;
}
