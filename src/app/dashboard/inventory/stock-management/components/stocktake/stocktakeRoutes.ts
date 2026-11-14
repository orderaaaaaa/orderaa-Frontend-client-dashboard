export const STOCKTAKE_LIST_HREF = '/dashboard/inventory/stock-management/stocktake';

export const stocktakeSheetHref = (stocktakeId: number) =>
  `${STOCKTAKE_LIST_HREF}/${stocktakeId}`;

export const stocktakeSessionBreadcrumbs = (stocktakeId: number) => [
  { label: 'إدارة المخزن', href: '/dashboard/inventory/stock-management' },
  { label: 'جرد المخزون', href: STOCKTAKE_LIST_HREF },
  { label: `#${stocktakeId}` },
];
