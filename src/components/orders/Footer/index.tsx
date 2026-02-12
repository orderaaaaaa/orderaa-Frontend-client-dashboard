import React from 'react';
import PaginationFooter from '@/components/ui/pagination-footer';

interface FooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  currentPageSize: number;
  onPageSizeChange: (size: number) => void;
  hasSelectedOrders?: boolean;
}

const Footer: React.FC<FooterProps> = ({ hasSelectedOrders, ...rest }) => (
  <PaginationFooter hasSelectedItems={hasSelectedOrders} {...rest} />
);

export default Footer;
