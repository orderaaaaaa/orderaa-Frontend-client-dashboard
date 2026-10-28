export const STOCKTAKE_LIST_HREF = '/dashboard/inventory/stock-management/stocktake';

export const stocktakeSheetHref = (stocktakeId: number) =>
  `${STOCKTAKE_LIST_HREF}/${stocktakeId}`;
