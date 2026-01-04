'use client';

import { useState, useEffect } from 'react';
import { Trash2, SquarePen, PackagePlus, CirclePlus } from 'lucide-react';
import { Order, OrderProductVariant } from '@/types/orders';
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
import { LiaLongArrowAltLeftSolid } from 'react-icons/lia';
import Image from 'next/image';

interface OrderDetailsProductCardProps {
  order: Order;
  isLockedByOther?: boolean;
}

function OrderDetailsProductCard({
  order,
  isLockedByOther = false,
}: OrderDetailsProductCardProps) {
  const updateOrderProductMutation = useUpdateOrderProduct();
  const deleteOrderProductMutation = useDeleteOrderProduct();
  const addOrderProductMutation = useAddOrderProduct();
  const { data: allProducts = [], error: productsError } = useAllProducts();

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null
  );
  const [isAddSameTypeModalOpen, setIsAddSameTypeModalOpen] = useState(false);
  const [isAddNewProductModalOpen, setIsAddNewProductModalOpen] =
    useState(false);
  const [viewingProductId, setViewingProductId] = useState<number | null>(null);
  const [productsData, setProductsData] = useState(
    order.order_products?.map((orderProduct) => ({
      id: orderProduct.id,
      productId: orderProduct.productId,
      product: orderProduct.products.name,
      variants: orderProduct.variants || [],
      price: orderProduct.price,
      img: orderProduct.products.image || '/wireless-headphones.png',
    })) || []
  );

  useEffect(() => {
    setProductsData(
      order.order_products?.map((orderProduct) => ({
        id: orderProduct.id,
        productId: orderProduct.productId,
        product: orderProduct.products.name,
        variants: orderProduct.variants || [],
        price: orderProduct.price,
        img: orderProduct.products.image || '/wireless-headphones.png',
      })) || []
    );
  }, [order.order_products]);

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

  const handleSaveEdit = async (
    productId: number,
    variants: SelectedVariant[]
  ) => {
    try {
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

  const handleAddSameTypeProduct = async (
    variants: SelectedVariant[],
    quantity: number
  ) => {
    try {
      const referenceProduct = productsData[0];
      if (!referenceProduct) {
        toast.error('لا توجد منتجات في الطلب');
        return;
      }

      await addOrderProductMutation.mutateAsync({
        orderId: order.id,
        productId: referenceProduct.productId,
        variants,
        quantity,
      });

      toast.success('تم إضافة المنتج بنجاح');
    } catch (error) {
      toast.error('فشل في إضافة المنتج');
    }
  };

  const handleAddNewProduct = async (
    productId: number,
    variants: SelectedVariant[],
    quantity: number
  ) => {
    await addOrderProductMutation.mutateAsync({
      orderId: order.id,
      productId,
      variants,
      quantity,
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {productsData.map((item) => (
            <div
              key={item.id}
              className="flex flex-col
              max-w-[390px]
              bg-gradient-to-b from-[#FFFFFF] to-[#EADBFF] border 
              rounded-[20px] pt-4 pb-3 px-2
              shadow-[0px_4px_4px_0px_#5D24E114]"
            >
              <div className="grid grid-cols-[1fr_1fr] gap-5">
                <div className="flex flex-col gap-2 mx-2">
                  <h3 className="text-[#1E1E1E] font-bold text-lg ">
                    {item.product}
                  </h3>

                  {item.variants.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {item.variants.map((variant, idx) => (
                        <p key={idx} className="text-base font-bold text-black">
                          {variant.label}: {variant.value}
                        </p>
                      ))}
                    </div>
                  )}

                  <p className="text-[#1E1E1E] font-bold text-lg ">
                    {item.price} جنيه
                  </p>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <div className="flex justify-end gap-2 mb-4">
                    <SquarePen
                      className={`w-4 transition-colors ${isLockedByOther
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:text-purple-700'
                        }`}
                      onClick={() =>
                        !isLockedByOther && handleEditClick(item.id)
                      }
                    />
                    {productsData.length > 1 && (
                      <Trash2
                        className={`w-4 text-red-600 transition-colors ${isLockedByOther
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer hover:text-red-700'
                          }`}
                        onClick={() =>
                          !isLockedByOther && handleDeleteClick(item.id)
                        }
                      />
                    )}
                  </div>
                  <Image
                    src={item.img}
                    alt={item.product}
                    width={120}
                    height={120}
                    className="w-[120px] h-[120px] border border-[#B8A3EB] rounded-xl object-cover shrink-0"
                  />
                </div>
              </div>
              <hr className="border border-gray-300 mt-3" />
              <div className="flex justify-start">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleViewDetailsClick(item.id)}
                  className="text-primary text-sm font-bold hover:underline text-right mt-1 hover:bg-transparent transition-colors hover:text-primary"
                >
                  المزيد
                  <LiaLongArrowAltLeftSolid className="w-4 h-4 rotate-45" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end items-start mb-4">
          <div className="flex gap-3">
            <Button
              onClick={() => setIsAddNewProductModalOpen(true)}
              disabled={isLockedByOther}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PackagePlus className="w-5 h-5" strokeWidth={2} />
              <span className="text-sm font-bold">إضافة منتج جديد</span>
            </Button>

            <Button
              onClick={() => setIsAddSameTypeModalOpen(true)}
              disabled={productsData.length === 0 || isLockedByOther}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary text-primary rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          currentVariants={editingProduct.variants.reduce(
            (acc, v) => ({ ...acc, [v.label]: v.value }),
            {} as Record<string, string>
          )}
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
        productId={productsData[0]?.productId || null}
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
