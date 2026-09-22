'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PaginationFooter from '@/components/ui/pagination-footer';
import PageLoading from '@/components/ui/page-loading';
import { useNameImpactQuery } from '@/services/canonicalNames';
import type { CanonicalNameDomain } from '@/types/canonicalNames';
import { CANONICAL_NAME_DOMAINS } from '@/types/canonicalNames';
import { VisualizedSpelling } from './SourceGroupRow';

interface NameImpactDialogProps {
  domain: CanonicalNameDomain;
  id: number;
  mode: 'view' | 'confirm-rename' | 'confirm-delete';
  pendingName?: string;
  confirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function NameImpactDialog({
  domain,
  id,
  mode,
  pendingName,
  confirming,
  onConfirm,
  onClose,
}: NameImpactDialogProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const { data: impact, isLoading } = useNameImpactQuery(
    domain,
    id,
    { page, limit },
    true,
  );
  const isAttributeOption = domain === CANONICAL_NAME_DOMAINS.ATTRIBUTE_OPTION;
  const isGovernorate = domain === CANONICAL_NAME_DOMAINS.GOVERNORATE;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'confirm-delete'
              ? 'تأكيد الحذف'
              : mode === 'confirm-rename'
                ? `تأكيد إعادة التسمية إلى ${pendingName ?? ''}`
                : 'عرض التأثير'}
          </DialogTitle>
        </DialogHeader>

        {isLoading || !impact ? (
          <PageLoading size="sm" />
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-700">
              سيتغير الاسم الظاهر في {impact.rowCount} عنصر داخل{' '}
              {impact.productCount} منتج
            </p>

            {impact.aliases.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  الصيغ المرتبطة
                </p>
                <div className="flex flex-wrap gap-2">
                  {impact.aliases.map((alias) => (
                    <Badge key={alias.normalizedText} variant="outline">
                      <VisualizedSpelling text={alias.sourceText} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isGovernorate && impact.children.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">المدن</p>
                <div className="flex flex-wrap gap-2">
                  {impact.children.map((child) => (
                    <Badge key={child.id} variant="outline">
                      {child.name} ({child.orderCount})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {impact.products.data.length > 0 && (
              <div className="max-h-64 overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="p-2 text-right">المنتج</th>
                      <th className="p-2 text-right">الإملاء المخزن</th>
                      {isAttributeOption && (
                        <th className="p-2 text-right">الخاصية</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {impact.products.data.map((product) =>
                      product.rows.map((row) => (
                        <tr key={row.id} className="border-t">
                          <td className="p-2">{product.productName}</td>
                          <td className="p-2">
                            <VisualizedSpelling text={row.storedName} />
                          </td>
                          {isAttributeOption && (
                            <td className="p-2">{row.attributeName ?? ''}</td>
                          )}
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
                <PaginationFooter
                  currentPage={impact.products.page}
                  totalPages={Math.max(
                    1,
                    Math.ceil(impact.products.total / impact.products.limit),
                  )}
                  totalItems={impact.products.total}
                  hasNextPage={
                    impact.products.page * impact.products.limit <
                    impact.products.total
                  }
                  hasPreviousPage={impact.products.page > 1}
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
          </div>
        )}

        <DialogFooter>
          {mode === 'view' ? (
            <Button onClick={onClose}>إغلاق</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button onClick={onConfirm} disabled={confirming}>
                تأكيد
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
