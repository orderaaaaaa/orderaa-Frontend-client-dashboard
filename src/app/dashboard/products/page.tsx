'use client';

import { LimitSelector } from '../employees/components/LimitSelector';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/ui/state-panels';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import ProductsHeader from './components/ProductsHeader';
import ProductsTable from './components/ProductsTable';
import { useProductStore } from './store/useProductStore';
import { useGetProducts } from './hooks/useProduct';

function ProductsPage() {
  const { page, limit, search, sortBy, sortOrder, setPage, setLimit } =
    useProductStore();
  const canRead = useHasPermissionStrict(PERMISSION_CODES.PRODUCTS_READ);
  const { data } = useGetProducts(
    { page, limit, search, sortBy, sortOrder },
    canRead
  );

  if (!canRead) {
    return <EmptyState title="ليست لديك صلاحية عرض المنتجات" />;
  }

  return (
    <div className="p-4">
      <ProductsHeader />
      <ProductsTable />

      <div className="flex max-sm:flex-col max-sm:gap-4 justify-between items-center mt-6 mb-4">
        <div className="text-lg text-gray-900">
          عرض{' '}
          <span className="font-bold">
            {Math.min(page * limit, data?.totalItems || 0)}
          </span>{' '}
          من أصل <span className="font-bold">{data?.totalItems || 0}</span> منتج
        </div>
        <Pagination
          currentPage={page}
          totalPages={data?.totalPages || 0}
          hasNextPage={!!data?.hasNextPage}
          hasPreviousPage={!!data?.hasPreviousPage}
          onPageChange={setPage}
        />
      </div>
      <LimitSelector limit={limit} onLimitChange={setLimit} />
    </div>
  );
}

export default ProductsPage;
