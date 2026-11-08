import type { OrderProduct } from '@/types/orders';

export const RETURN_SHIPMENT_CONTENT_MAX_LENGTH = 1000;

export const isBlankReturnShipmentContent = (value: string | null | undefined): boolean =>
  value == null || value.trim() === '';

export type ReturnContentVariantPart = { name: string; value: string };

export const variantPartsLabelOf = (parts: ReturnContentVariantPart[]): string =>
  parts.map((part) => `${part.name}: ${part.value}`).join(' • ');

export const variantLabelOf = (op: OrderProduct) => {
  const attrs = (op.attributes ?? []).filter(
    (a) => a?.name && a?.options?.name,
  );
  return attrs.length > 0
    ? variantPartsLabelOf(attrs.map((a) => ({ name: a.name, value: a.options.name })))
    : (op.products.extraDetails?.variants ?? [])
        .map((v) => v.title)
        .join(' • ');
};

export type ReturnContentPiece = { name: string; variantLabel: string };

const pieceContentLabelOf = (piece: ReturnContentPiece) =>
  piece.variantLabel ? `${piece.name} (${piece.variantLabel})` : piece.name;

export const returnShipmentContentOfPieces = (pieces: ReturnContentPiece[]): string => {
  const countByLabel = new Map<string, number>();
  pieces.forEach((piece) => {
    const label = pieceContentLabelOf(piece);
    countByLabel.set(label, (countByLabel.get(label) ?? 0) + 1);
  });
  return Array.from(countByLabel, ([label, count]) => (count > 1 ? `${label} × ${count}` : label)).join('، ');
};

export const returnShipmentContentOf = (refusedUnits: OrderProduct[]): string =>
  returnShipmentContentOfPieces(
    refusedUnits.map((unit) => ({
      name: unit.products.name,
      variantLabel: variantLabelOf(unit),
    })),
  );
