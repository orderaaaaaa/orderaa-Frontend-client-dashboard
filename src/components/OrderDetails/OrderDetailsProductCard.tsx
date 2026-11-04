'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LiaTrashAltSolid,
  LiaBoxSolid,
  LiaPlusCircleSolid,
  LiaLongArrowAltLeftSolid,
  LiaEditSolid,
} from 'react-icons/lia';
import { Order } from '@/types/orders';
import EditProductModal from './EditProductModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddSameTypeProductModal from './AddSameTypeProductModal';
import AddNewProductModal from './AddNewProductModal';
import ProductDetailsModal from './ProductDetailsModal';
import SendBackConfirmModal from './SendBackConfirmModal';
import OrderStockReturnRequiredModal from './OrderStockReturnRequiredModal';
import {
  useUpdateOrderProduct,
  useDeleteOrderProduct,
  useAddOrderProduct,
} from '@/services/orders';
import { ORDER_LINE_EDIT_CONFLICT } from '@/types/orderLineEdits';
import { getAvailabilityRefusalMessage, getOrderLineEditConflict } from '@/utils/apiError';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useOrderStockAvailabilityQuery } from '@/services/warehouses';
import { NEXT_STOCK_TARGET } from '@/lib/api/warehouses';
import { StockAvailabilityBadge } from './StockAvailabilityBadge';
import Image from 'next/image';
import CopyableCode from '@/components/ui/copyable-code';
import ProductReturnOfChip from './ProductReturnOfChip';
import ProductSpecificationRows from './ProductSpecificationRows';

interface OrderDetailsProductCardProps {
  order: Order;
  isLockedByOther?: boolean;
}

interface PendingSendBack {
  retry: () => Promise<unknown>;
  onApplied: () => void;
}

function OrderDetailsProductCard({
  order,
  isLockedByOther = false,
}: OrderDetailsProductCardProps) {
  const updateOrderProductMutation = useUpdateOrderProduct();
  const deleteOrderProductMutation = useDeleteOrderProduct();
  const addOrderProductMutation = useAddOrderProduct();
  // Add / edit / delete of order products all sit behind `orders:products:manage`.
  const { hasPermission } = usePermissionCheck();
  const canManageProducts = hasPermission(PERMISSION_CODES.ORDERS_PRODUCTS_MANAGE);

  // T27: availability against CONFIRMED — the transition an agent on this
  // screen is about to make. Keyed by orderProductId because each LINE resolves
  // its own rule and therefore its own source warehouse.
  const { data: availability } = useOrderStockAvailabilityQuery(
    order.id,
    NEXT_STOCK_TARGET
  );
  const availabilityByLine = new Map(
    (availability?.lines ?? []).map((line) => [line.orderProductId, line])
  );

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null
  );
  const [isAddSameTypeModalOpen, setIsAddSameTypeModalOpen] = useState(false);
  const [isAddNewProductModalOpen, setIsAddNewProductModalOpen] =
    useState(false);
  const [viewingProductId, setViewingProductId] = useState<number | null>(null);
  const [pendingSendBack, setPendingSendBack] = useState<PendingSendBack | null>(
    null
  );
  const [pendingStockReturn, setPendingStockReturn] = useState<string | null>(
    null
  );
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
        // T22: the specifications snapshot taken when the order was placed.
        specifications: orderProduct.specifications ?? [],
        price: orderProduct.price,
        sku: orderProduct.sku || orderProduct.products.sku || null,
        img: orderProduct.products.image || '/wireless-headphones.png',
        returnOf: orderProduct.returnOf ?? null,
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

  const runLineEdit = async (
    send: (sendBackToPackaging: boolean) => Promise<unknown>,
    onApplied: () => void
  ): Promise<boolean> => {
    try {
      await send(false);
      return true;
    } catch (err: unknown) {
      const conflict = getOrderLineEditConflict(err);
      if (conflict?.code === ORDER_LINE_EDIT_CONFLICT.SEND_BACK_REQUIRED) {
        setPendingSendBack({ retry: () => send(true), onApplied });
        return false;
      }
      if (conflict?.code === ORDER_LINE_EDIT_CONFLICT.RETURN_REQUIRED) {
        setPendingStockReturn(conflict.message);
        return false;
      }
      throw err;
    }
  };

  const handleConfirmSendBack = async () => {
    if (!pendingSendBack) return;
    await pendingSendBack.retry();
    pendingSendBack.onApplied();
    setPendingSendBack(null);
  };

  const handleSaveEdit = async (
    productId: number,
    attributeOptionIds: number[]
  ): Promise<boolean> => {
    const notifyUpdated = () => toast.success('تم تحديث المنتج بنجاح');
    try {
      const applied = await runLineEdit(
        (sendBackToPackaging) =>
          updateOrderProductMutation.mutateAsync({
            orderProductId: productId,
            attributeOptionIds,
            sendBackToPackaging,
          }),
        () => {
          notifyUpdated();
          setEditingProductId(null);
        }
      );
      if (applied) notifyUpdated();
      return applied;
    } catch (error: any) {
      toast.error(getAvailabilityRefusalMessage(error, 'فشل في تحديث المنتج'));
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return false;
    const productId = deletingProductId;
    return runLineEdit(
      (sendBackToPackaging) =>
        deleteOrderProductMutation.mutateAsync({
          orderProductId: productId,
          sendBackToPackaging,
        }),
      () => {
        setDeletingProductId(null);
        toast.success('تم حذف المنتج بنجاح');
      }
    );
  };

  const editingProduct = productsData.find(
    (item) => item.id === editingProductId
  );

  const editingCurrentVariants = useMemo(
    () =>
      (editingProduct?.attributes ?? []).reduce<Record<string, string>>((acc, attr) => {
        if (attr.name && attr.value) acc[attr.name] = attr.value;
        return acc;
      }, {}),
    [editingProduct]
  );

  const deletingProduct = productsData.find(
    (item) => item.id === deletingProductId
  );

  const viewingOrderProduct = order.order_products?.find(
    (orderProduct) => orderProduct.id === viewingProductId
  );

  const notifyAdded = () => toast.success('تم إضافة المنتج بنجاح');

  const handleAddSameTypeProduct = async (
    attributeOptionIds: number[],
    quantity: number
  ): Promise<boolean> => {
    try {
      const referenceProduct = productsData[0];
      if (!referenceProduct) {
        toast.error('لا توجد منتجات في الطلب');
        return false;
      }

      const applied = await runLineEdit(
        (sendBackToPackaging) =>
          addOrderProductMutation.mutateAsync({
            orderId: order.id,
            productId: referenceProduct.productId,
            attributeOptionIds,
            quantity,
            sendBackToPackaging,
          }),
        () => {
          notifyAdded();
          setIsAddSameTypeModalOpen(false);
        }
      );
      if (applied) notifyAdded();
      return applied;
    } catch (err: any) {
      toast.error(getAvailabilityRefusalMessage(err, 'فشل في إضافة المنتج'));
      return false;
    }
  };

  const handleAddNewProduct = async (
    productId: number,
    attributeOptionIds: number[],
    quantity: number
  ): Promise<boolean> =>
    runLineEdit(
      (sendBackToPackaging) =>
        addOrderProductMutation.mutateAsync({
          orderId: order.id,
          productId,
          attributeOptionIds,
          quantity,
          sendBackToPackaging,
        }),
      () => {
        notifyAdded();
        setIsAddNewProductModalOpen(false);
      }
    );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {productsData.map((item) => (
            <div
              key={item.id}
              className="flex flex-col
              max-w-[390px]
              bg-gradient-to-b from-card to-primary/15 border 
              rounded-[20px] pt-4 pb-3 px-2
              shadow-[0px_4px_4px_0px_#5D24E114]"
            >
              <div className="grid grid-cols-[1fr_1fr] gap-5">
                <div className="flex flex-col gap-2 mx-2">
                  <h3 className="text-foreground font-bold text-lg ">
                    {item.product}
                  </h3>

                  {item.returnOf && (
                    <ProductReturnOfChip
                      orderId={item.returnOf.orderId}
                      orderCode={item.returnOf.orderCode}
                    />
                  )}

                  {/* T22 — المواصفات: product-wide facts recorded at order
                      time. Distinct from the variant lines below, and absent
                      specs render NOTHING rather than an empty block, which is
                      the normal case for most products. */}
                  <ProductSpecificationRows specifications={item.specifications} />

                  {item.attributes.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {item.attributes.map((attr) => (
                        <p
                          key={attr.id}
                          className="text-base font-bold text-foreground"
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
                            className="text-base font-bold text-foreground"
                          >
                            {variant.title}
                          </p>
                        ))}
                      </div>
                    )
                  )}

                  {item.sku && (
                    <p className="text-sm font-medium text-gray-500">
                      SKU: <CopyableCode value={item.sku} label="نسخ كود المنتج">{item.sku}</CopyableCode>
                    </p>
                  )}

                  <StockAvailabilityBadge
                    line={availabilityByLine.get(item.id)}
                  />

                  <p className="text-foreground font-bold text-lg ">
                    {item.price} جنيه
                  </p>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <div className="flex justify-end gap-2 mb-4">
                    {canManageProducts && (
                      <LiaEditSolid
                        className={`w-4 h-4 transition-colors ${isLockedByOther
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer hover:text-purple-700'
                          }`}
                        onClick={() =>
                          !isLockedByOther && handleEditClick(item.id)
                        }
                      />
                    )}
                    {canManageProducts && productsData.length > 1 && (
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
                    className="w-[120px] h-[120px] border border-primary/50 rounded-xl object-cover shrink-0"
                  />
                </div>
              </div>
              <hr className="border border-gray-300 mt-3" />
              <div className="flex justify-start">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleViewDetailsClick(item.id)}
                  className="text-primary-text text-sm font-bold hover:underline text-right mt-1 hover:bg-transparent transition-colors hover:text-primary-text"
                >
                  المزيد
                  <LiaLongArrowAltLeftSolid className="w-4 h-4 rotate-45" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 mb-4 flex flex-col gap-3">
          {canManageProducts && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setIsAddNewProductModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LiaBoxSolid className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold whitespace-nowrap">إضافة منتج جديد</span>
              </Button>

              <Button
                onClick={() => setIsAddSameTypeModalOpen(true)}
                disabled={productsData.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-card border-2 border-primary text-primary-text rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LiaPlusCircleSolid className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold whitespace-nowrap">إضافة منتج من نفس النوع</span>
              </Button>
            </div>
          )}
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
          currentVariants={editingCurrentVariants}
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
        orderId={order.id}
        onClose={() => setIsAddNewProductModalOpen(false)}
        onSave={handleAddNewProduct}
      />

      <SendBackConfirmModal
        isOpen={pendingSendBack !== null}
        onClose={() => setPendingSendBack(null)}
        onConfirm={handleConfirmSendBack}
      />

      <OrderStockReturnRequiredModal
        isOpen={pendingStockReturn !== null}
        onClose={() => setPendingStockReturn(null)}
        orderId={order.id}
        message={pendingStockReturn ?? ''}
      />

      <ProductDetailsModal
        isOpen={viewingProductId !== null}
        onClose={() => setViewingProductId(null)}
        orderProduct={viewingOrderProduct || null}
        order={order}
      />
    </>
  );
}

export default OrderDetailsProductCard;
