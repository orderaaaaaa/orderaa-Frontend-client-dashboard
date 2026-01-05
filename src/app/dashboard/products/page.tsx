'use client';

import { LimitSelector } from '../employees/components/LimitSelector';
import { Pagination } from '@/components/Pagination';
import ProductsHeader from './components/ProductsHeader';
import ProductsTable from './components/ProductsTable';
import { useProductStore } from './store/useProductStore';
import { useGetProducts } from './hooks/useProduct';

function productsPage() {
  const { page, limit, setPage, setLimit } = useProductStore(); // Added setLimit
  const { data } = useGetProducts(page, limit); //

  return (
    <div className="p-4">
      <ProductsHeader />

      <ProductsTable />
      <div className="flex max-sm:flex-col-reverse gap-5 md:justify-between items-center p-4 mt-5">
        {/* Limit selector */}
        <div className="w-full md:w-auto flex justify-start">
          <LimitSelector limit={limit} onLimitChange={setLimit} />
        </div>

        {/* Pagination */}
        <div className="w-full md:w-auto flex justify-center md:justify-start">
          <div className="flex max-sm:flex-col max-sm:gap-4 justify-between items-center mt-6 mb-4">
            <div className="text-lg text-gray-900">
              عرض <span className="font-bold">{`${limit}`}</span> من أصل{' '}
              <span className="font-bold">{data?.totalItems}</span> موظف
            </div>
            <Pagination
              currentPage={page}
              totalPages={data?.totalPages || 0}
              hasNextPage={!!data?.hasNextPage}
              hasPreviousPage={!!data?.hasPreviousPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default productsPage;
