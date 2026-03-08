import { Suspense } from 'react';
import { CustomersContent } from './components';
import LoadingAnimation from '@/components/ui/loadingAnimation';

export default function CustomersPage() {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <CustomersContent />
    </Suspense>
  );
}
