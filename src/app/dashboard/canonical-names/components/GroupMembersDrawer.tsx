'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PaginationFooter from '@/components/ui/pagination-footer';
import PageLoading from '@/components/ui/page-loading';
import { useGroupMembersQuery } from '@/services/canonicalNames';
import type { CanonicalNameDomain } from '@/types/canonicalNames';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import { VisualizedSpelling } from './SourceGroupRow';

interface GroupMembersDrawerProps {
  domain: CanonicalNameDomain;
  scopeId: number;
  normalizedText: string;
  onClose: () => void;
}

export default function GroupMembersDrawer({
  domain,
  scopeId,
  normalizedText,
  onClose,
}: GroupMembersDrawerProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const { data, isLoading } = useGroupMembersQuery(
    domain,
    { scopeId, normalizedText, page, limit },
    true,
  );
  const isAttributeOption = domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>المنتجات المرتبطة بهذه القيمة</DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <PageLoading size="sm" />
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-2 text-right">المنتج</th>
                  <th className="p-2 text-right">الإملاء المخزن</th>
                  {isAttributeOption && (
                    <th className="p-2 text-right">الخاصية</th>
                  )}
                  <th className="p-2 text-right">الاسم الموحد</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) =>
                  product.rows.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-2">{product.productName}</td>
                      <td className="p-2">
                        <VisualizedSpelling text={row.storedName} />
                      </td>
                      {isAttributeOption && (
                        <td className="p-2">{row.attributeName ?? ''}</td>
                      )}
                      <td className="p-2">
                        {row.canonicalNameId ? 'مرتبط' : 'غير مرتبط'}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
            <PaginationFooter
              currentPage={data.page}
              totalPages={Math.max(1, Math.ceil(data.total / data.limit))}
              totalItems={data.total}
              hasNextPage={data.page * data.limit < data.total}
              hasPreviousPage={data.page > 1}
              onPageChange={setPage}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => p + 1)}
              currentPageSize={limit}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
