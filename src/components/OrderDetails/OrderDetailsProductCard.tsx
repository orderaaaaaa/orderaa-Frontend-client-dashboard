'use client';

import { useState, useEffect } from 'react';
import { Trash2, SquarePen, PackagePlus, CirclePlus } from 'lucide-react';
import { Order } from '@/types/orders';
import EditProductModal from './EditProductModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddSameTypeProductModal from './AddSameTypeProductModal';
import AddNewProductModal from './AddNewProductModal';
import ProductDetailsModal from './ProductDetailsModal';
import {
  useUpdateOrderProduct,
  useDeleteOrderProduct,
  useAddOrderProduct,
  useAllProducts,
  SelectedVariant,
} from '@/services/orders';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

interface OrderDetailsProductCardProps {
  order: Order;
}

function parseVariantToRecord(variant: string | null | undefined): Record<string, string> {
  if (!variant) {
    return {};
  }

  // Try to parse as JSON array of {label, value} objects
  try {
    const parsed = JSON.parse(variant);
    if (Array.isArray(parsed)) {
      const record: Record<string, string> = {};
      parsed.forEach((item: { label?: string; value?: string }) => {
        if (item.label && item.value) {
          record[item.label] = item.value;
        }
      });
      return record;
    }
  } catch {
    // Not JSON, try legacy format
  }

  // Legacy format: "size - color"
  if (variant.includes(' - ')) {
    const [size, color] = variant.split(' - ').map(s => s.trim());
    return { size: size || '', color: color || '' };
  }

  // Check if it's just a number (size)
  if (/^\d+$/.test(variant.trim())) {
    return { size: variant.trim() };
  }

  // Otherwise, assume it's a color
  return { color: variant.trim() };
}

function OrderDetailsProductCard({ order }: OrderDetailsProductCardProps) {
  // React Query mutations and queries
  const updateOrderProductMutation = useUpdateOrderProduct();
  const deleteOrderProductMutation = useDeleteOrderProduct();
  const addOrderProductMutation = useAddOrderProduct();
  const { data: allProducts = [], error: productsError } = useAllProducts();

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [isAddSameTypeModalOpen, setIsAddSameTypeModalOpen] = useState(false);
  const [isAddNewProductModalOpen, setIsAddNewProductModalOpen] = useState(false);
  const [viewingProductId, setViewingProductId] = useState<number | null>(null);
  const [productsData, setProductsData] = useState(
    order.order_products?.map((orderProduct) => {
      // Parse the variant to get variants record
      const variants = parseVariantToRecord(orderProduct.variant);

      return {
        id: orderProduct.id,
        productId: orderProduct.productId,
        product: orderProduct.products.name,
        variants,
        price: orderProduct.price,
        img: orderProduct.products.image || '/wireless-headphones.png',
      };
    }) || []
  );

  // Sync productsData when order.order_products changes (e.g., after query invalidation)
  useEffect(() => {
    setProductsData(
      order.order_products?.map((orderProduct) => {
        const variants = parseVariantToRecord(orderProduct.variant);
        return {
          id: orderProduct.id,
          productId: orderProduct.productId,
          product: orderProduct.products.name,
          variants,
          price: orderProduct.price,
          img: orderProduct.products.image || '/wireless-headphones.png',
        };
      }) || []
    );
  }, [order.order_products]);

  // Show error if products fail to load
  useEffect(() => {
    if (productsError) {
      toast.error('فشل في تحميل المنتجات');
    }
  }, [productsError]);

  const handleEditClick = (productId: number) => {
    setEditingProductId(productId);
  };

  const handleDeleteClick = (productId: number) => {
    setDeletingProductId(productId);
  };

  const handleViewDetailsClick = (productId: number) => {
    setViewingProductId(productId);
  };

  const handleSaveEdit = async (productId: number, variants: SelectedVariant[]) => {
    try {
      // Call backend API using mutation (handles cache invalidation automatically)
      await updateOrderProductMutation.mutateAsync({
        orderProductId: productId,
        variants,
      });

      toast.success('تم تحديث المنتج بنجاح');
    } catch (error) {
      toast.error('فشل في تحديث المنتج');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;

    try {
      // Call backend API using mutation (handles cache invalidation automatically)
      await deleteOrderProductMutation.mutateAsync(deletingProductId);
      toast.success('تم حذف المنتج بنجاح');
    } catch (error) {
      toast.error('فشل في حذف المنتج');
    }
  };

  const editingProduct = productsData.find(
    (item) => item.id === editingProductId
  );

  const deletingProduct = productsData.find(
    (item) => item.id === deletingProductId
  );

  const viewingOrderProduct = order.order_products?.find(
    (orderProduct) => orderProduct.id === viewingProductId
  );

  const handleAddSameTypeProduct = async (size: string, color: string, quantity: number) => {
    try {
      // Get the first product as the reference (assuming they all have the same type in this order)
      const referenceProduct = productsData[0];
      if (!referenceProduct) {
        toast.error('لا توجد منتجات في الطلب');
        return;
      }

      const variants = [
        { label: 'Size', value: size },
        { label: 'Color', value: color },
      ];
      const price = referenceProduct.price; // Use same price as reference product

      // Add product to order using mutation (handles cache invalidation automatically)
      await addOrderProductMutation.mutateAsync({
        orderId: order.id,
        productId: referenceProduct.productId,
        variants,
        quantity,
        price,
      });

      toast.success('تم إضافة المنتج بنجاح');
    } catch (error) {
      toast.error('فشل في إضافة المنتج');
    }
  };

  const handleAddNewProduct = async (productId: number, variants: SelectedVariant[], quantity: number) => {
    const selectedProduct = allProducts.find(p => p.id === productId);
    if (!selectedProduct) {
      throw new Error('المنتج غير موجود');
    }

    const price = selectedProduct.price || 0;

    // Add product to order using mutation (handles cache invalidation automatically)
    await addOrderProductMutation.mutateAsync({
      orderId: order.id,
      productId,
      variants,
      quantity,
      price,
    });
  };

  return (
    <>
      {/* Header with action buttons */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          {productsData.map((item) => (
            <div
              key={item.id}
              className="grid
              grid-cols-[1fr_1fr]
              gap-5
              max-w-[380px]
              bg-gradient-to-b from-[#FCFAFD] to-[#EADBFF] border-2 border-[#5D24E147]
              rounded-[20px] py-4 px-2
              shadow-[0px_4px_4px_0px_#5D24E114]"
            >
              <div className="flex flex-col gap-2 mx-2">
                <h3 className="text-[#1E1E1E] font-bold text-lg ">
                  {item.product}
                </h3>
                {/* <p className="text-[#1E1E1E] font-bold text-lg ">اللون: {item.color}</p>
                <p className="text-[#1E1E1E] font-bold text-lg ">القياس: {item.size}</p> */}

                <p className="text-[#1E1E1E] font-bold text-lg ">
                  {item.price} جنيه
                </p>

                <Button
                  variant="ghost"
                  onClick={() => handleViewDetailsClick(item.id)}
                  className="text-[#5D24E1] text-sm font-bold hover:underline text-right mt-1"
                >
                  عرض المزيد
                </Button>
              </div>
              <div className="flex flex-col items-end ml-3">
                <div className="flex justify-end gap-2 mb-2">
                  {productsData.length > 1 && (
                    <Trash2
                      className="cursor-pointer w-5 text-red-600 hover:text-red-700 transition-colors"
                      onClick={() => handleDeleteClick(item.id)}
                    />
                  )}
                  <SquarePen
                    className="cursor-pointer w-5 hover:text-purple-700 transition-colors"
                    onClick={() => handleEditClick(item.id)}
                  />
                </div>
                <img
                  src={item.img}
                  alt=""
                  className="border-1 flex border-[#B8A3EB] rounded-2xl w-[120px] h-[120px] object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end items-start mb-4">
          <div className="flex gap-3">
            <Button
              onClick={() => setIsAddNewProductModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#5D24E1] text-white rounded-lg hover:bg-[#4B1BC4] transition-colors"
            >
              <PackagePlus className="w-5 h-5" strokeWidth={2} />
              <span className="text-sm font-bold">إضافة منتج جديد</span>
            </Button>

            <Button
              onClick={() => setIsAddSameTypeModalOpen(true)}
              disabled={productsData.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#5D24E1] text-[#5D24E1] rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CirclePlus className="w-5 h-5" strokeWidth={2} />
              <span className="text-sm font-bold">إضافة منتج من نفس النوع</span>
            </Button>
          </div>
        </div>
      </div>

      {editingProduct && (
        <EditProductModal
          isOpen={editingProductId !== null}
          onClose={() => setEditingProductId(null)}
          onSave={(variants) => handleSaveEdit(editingProduct.id, variants)}
          productId={editingProduct.productId}
          currentVariants={editingProduct.variants}
        />
      )}

      {deletingProduct && (
        <DeleteConfirmationModal
          isOpen={deletingProductId !== null}
          onClose={() => setDeletingProductId(null)}
          onConfirm={handleConfirmDelete}
          productName={deletingProduct.product}
        />
      )}

      <AddSameTypeProductModal
        isOpen={isAddSameTypeModalOpen}
        onClose={() => setIsAddSameTypeModalOpen(false)}
        onSave={handleAddSameTypeProduct}
        productType={productsData[0]?.product || ''}
      />

      <AddNewProductModal
        isOpen={isAddNewProductModalOpen}
        onClose={() => setIsAddNewProductModalOpen(false)}
        onSave={handleAddNewProduct}
        products={allProducts}
      />

      <ProductDetailsModal
        isOpen={viewingProductId !== null}
        onClose={() => setViewingProductId(null)}
        orderProduct={viewingOrderProduct || null}
      />
    </>
  );
}

export default OrderDetailsProductCard;
