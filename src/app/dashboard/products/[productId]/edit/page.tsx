'use client';

import { useParams } from 'next/navigation';
import { ProductEditor } from '../../components/editor/ProductEditor';

export default function ProductEditPage() {
  const params = useParams<{ productId: string }>();
  const productId = Number(params?.productId);
  return <ProductEditor key={productId} productId={productId} />;
}
