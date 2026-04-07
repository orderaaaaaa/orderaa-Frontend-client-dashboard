'use client';

import { useState, useEffect } from 'react';
import {
  LiaTrashAltSolid,
  LiaBoxSolid,
  LiaPlusCircleSolid,
  LiaLongArrowAltLeftSolid,
  LiaClipboardListSolid,
} from 'react-icons/lia';
import { Order, OrderProductVariant } from '@/types/orders';
import EditProductModal from './EditProductModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddSameTypeProductModal from './AddSameTypeProductModal';
import AddNewProductModal from './AddNewProductModal';
import ProductDetailsModal from './ProductDetailsModal';
import ProductActionMenu from './ProductActionMenu';
import SwapProductModal from './ActionModals/SwapProductModal';
import ProductChangeLogModal from './ProductChangeLogModal';
import {
  useUpdateOrderProduct,
  useDeleteOrderProduct,
  useAddOrderProduct,
  SelectedVariant,
} from '@/services/orders';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
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

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null
  );
  const [isAddSameTypeModalOpen, setIsAddSameTypeModalOpen] = useState(false);
  const [isAddNewProductModalOpen, setIsAddNewProductModalOpen] =
    useState(false);
  const [viewingProductId, setViewingProductId] = useState<number | null>(null);
  const [swapProductId, setSwapProductId] = useState<number | null>(null);
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);
  const [productsData, setProductsData] = useState(
    order.order_products?.map((orderProduct) => ({
      id: orderProduct.id,
      productId: orderProduct.productId,
      product: orderProduct.products.name,
      variants: orderProduct.variants || [],
      price: orderProduct.price,
      sku: orderProduct.sku || orderProduct.products.sku || null,
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
        sku: orderProduct.sku || orderProduct.products.sku || null,
        img: orderProduct.products.image || '/wireless-headphones.png',
      })) || []
    );
  }, [order.order_products]);

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
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(message || 'فشل في تحديث المنتج');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;
    await deleteOrderProductMutation.mutateAsync(deletingProductId);
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

  const swapProduct = productsData.find(
    (item) => item.id === swapProductId
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

                  {item.sku && (
                    <p className="text-sm font-medium text-gray-500">
                      SKU: {item.sku}
                    </p>
                  )}

                  <p className="text-[#1E1E1E] font-bold text-lg ">
                    {item.price} جنيه
                  </p>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <div className="flex justify-end gap-2 mb-4">
                    <ProductActionMenu
                      onModify={() => handleEditClick(item.id)}
                      onSwap={() => setSwapProductId(item.id)}
                      disabled={isLockedByOther}
                    />
                    {productsData.length > 1 && (
                      <LiaTrashAltSolid
                        className={`w-4 h-4 text-red-600 transition-colors ${isLockedByOther
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
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LiaBoxSolid className="w-5 h-5" />
              <span className="text-sm font-bold">إضافة منتج جديد</span>
            </Button>

            <Button
              onClick={() => setIsAddSameTypeModalOpen(true)}
              disabled={productsData.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary text-primary rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LiaPlusCircleSolid className="w-5 h-5" />
              <span className="text-sm font-bold">إضافة منتج من نفس النوع</span>
            </Button>

            <Button
              onClick={() => setIsChangeLogOpen(true)}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LiaClipboardListSolid className="w-5 h-5" />
              <span className="text-sm font-bold">سجل التغييرات</span>
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
      />

      <ProductDetailsModal
        isOpen={viewingProductId !== null}
        onClose={() => setViewingProductId(null)}
        orderProduct={viewingOrderProduct || null}
      />

      {swapProduct && (
        <SwapProductModal
          isOpen={swapProductId !== null}
          onClose={() => setSwapProductId(null)}
          currentProduct={{
            id: swapProduct.id,
            name: swapProduct.product,
            price: swapProduct.price,
            variants: swapProduct.variants,
          }}
        />
      )}

      <ProductChangeLogModal
        isOpen={isChangeLogOpen}
        onClose={() => setIsChangeLogOpen(false)}
        orderId={order.id}
      />
    </>
  );
}

export default OrderDetailsProductCard;
