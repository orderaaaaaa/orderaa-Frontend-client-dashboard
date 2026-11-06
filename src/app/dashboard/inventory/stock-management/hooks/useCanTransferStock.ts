import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';

export function useCanTransferStock() {
  const canTransfer = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_TRANSFER);
  const canReadWarehouses = useHasPermissionStrict(PERMISSION_CODES.WAREHOUSES_STOCK_READ);
  const canReadProducts = useHasPermissionStrict(PERMISSION_CODES.PRODUCTS_STOCK_READ);
  return canTransfer && canReadWarehouses && canReadProducts;
}
