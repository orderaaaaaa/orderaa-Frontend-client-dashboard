'use client';

import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStockWarehouseOptions } from '@/services/productStock';
import { STOCK_TRANSFER_HREF } from '../constants';
import { useCanTransferStock } from '../hooks/useCanTransferStock';

interface TransferStockLinkProps {
  standalone?: boolean;
}

export function TransferStockLink({ standalone = false }: TransferStockLinkProps) {
  const canTransfer = useCanTransferStock();
  const { movePickerOptions, isLoading, isError } = useStockWarehouseOptions({
    enabled: canTransfer,
  });

  if (!canTransfer || isLoading || isError || movePickerOptions.length < 2) return null;

  const link = (
    <Button asChild variant="outline" size="sm" className="h-10 w-full sm:h-9 sm:w-auto">
      <Link href={STOCK_TRANSFER_HREF}>
        <ArrowLeftRight aria-hidden="true" />
        نقل المخزون
      </Link>
    </Button>
  );

  return standalone ? <div className="flex justify-end">{link}</div> : link;
}
