'use client';

import { useState, useEffect } from 'react';
import {
  LiaTrashAltSolid,
  LiaBoxSolid,
  LiaPlusCircleSolid,
  LiaLongArrowAltLeftSolid,
  LiaClipboardListSolid,
  LiaEditSolid,
} from 'react-icons/lia';
import { Order } from '@/types/orders';
import EditProductModal from './EditProductModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddSameTypeProductModal from './AddSameTypeProductModal';
import AddNewProductModal from './AddNewProductModal';
import ProductDetailsModal from './ProductDetailsModal';
import ProductChangeLogModal from './ProductChangeLogModal';
import {
  useUpdateOrderProduct,
  useDeleteOrderProduct,
  useAddOrderProduct,
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
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);
  const buildProductsData = (orderArg: Order) =>
    orderArg.order_products?.map((orderProduct) => {
      const extra = orderProduct.products.extraDetails;
      const variants = extra?.variants ?? [];
      const fullVariant = extra?.fullVariants?.find(
        (fv) => fv.productId === orderProduct.productId
      );
      const optionLabels = fullVariant?.variantOptions?.map((o) => o.attribute) ?? [];
      const attributes = (orderProduct.attributes ?? [])
        .filter((attr) => attr?.name && attr?.options?.name)
        .map((attr) => ({
          id: attr.id,
          name: attr.name,
          value: attr.options.name,
        }));
      return {
        id: orderProduct.id,
        productId: orderProduct.productId,
        product: orderProduct.products.name,
        variants,
        optionLabels,
        attributes,
        price: orderProduct.price,
        sku: orderProduct.sku || orderProduct.products.sku || null,
        img: orderProduct.products.image || '/wireless-headphones.png',
      };
    }) || [];

  const [productsData, setProductsData] = useState(buildProductsData(order));

  useEffect(() => {
    setProductsData(buildProductsData(order));
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
    attributeOptionIds: number[]
  ) => {
    try {
      await updateOrderProductMutation.mutateAsync({
        orderProductId: productId,
        attributeOptionIds,
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

  const handleAddSameTypeProduct = async (
    attributeOptionIds: number[],
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
        attributeOptionIds,
        quantity,
      });

      toast.success('تم إضافة المنتج بنجاح');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل في إضافة المنتج');
    }
  };

  const handleAddNewProduct = async (
    productId: number,
    attributeOptionIds: number[],
    quantity: number
  ) => {
    await addOrderProductMutation.mutateAsync({
      orderId: order.id,
      productId,
      attributeOptionIds,
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

                  {item.attributes.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {item.attributes.map((attr) => (
                        <p
                          key={attr.id}
                          className="text-base font-bold text-black"
                        >
                          {attr.name}: {attr.value}
                        </p>
                      ))}
                    </div>
                  ) : (
                    item.variants.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {item.variants.map((variant) => (
                          <p
                            key={variant.id}
                            className="text-base font-bold text-black"
                          >
                            {variant.title}
                          </p>
                        ))}
                      </div>
                    )
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
                    <LiaEditSolid
                      className={`w-4 h-4 transition-colors ${isLockedByOther
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:text-purple-700'
                        }`}
                      onClick={() =>
                        !isLockedByOther && handleEditClick(item.id)
                      }
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

        <div className="mt-6 mb-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setIsAddNewProductModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LiaBoxSolid className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold whitespace-nowrap">إضافة منتج جديد</span>
            </Button>

            <Button
              onClick={() => setIsAddSameTypeModalOpen(true)}
              disabled={productsData.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-primary text-primary rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LiaPlusCircleSolid className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold whitespace-nowrap">إضافة منتج من نفس النوع</span>
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => setIsChangeLogOpen(true)}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LiaClipboardListSolid className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold whitespace-nowrap">سجل التغييرات</span>
            </Button>
          </div>
        </div>
      </div>

      {editingProduct && (
        <EditProductModal
          isOpen={editingProductId !== null}
          onClose={() => setEditingProductId(null)}
          onSave={(attributeOptionIds) =>
            handleSaveEdit(editingProduct.id, attributeOptionIds)
          }
          productId={editingProduct.productId}
          currentVariants={editingProduct.attributes.reduce<Record<string,string>>((acc, attr) => {
            if (attr.name && attr.value) acc[attr.name] = attr.value;
            return acc;
          }, {})}
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

      <ProductChangeLogModal
        isOpen={isChangeLogOpen}
        onClose={() => setIsChangeLogOpen(false)}
        orderId={order.id}
      />
    </>
  );
}

export default OrderDetailsProductCard;
