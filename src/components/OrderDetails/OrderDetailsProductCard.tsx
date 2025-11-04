'use client';

import { useState, useEffect } from 'react';
import { Trash2, SquarePen, Copy, Plus } from 'lucide-react';
import { Order, Product } from '@/types/orders';
import EditProductModal from './EditProductModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddSameTypeProductModal from './AddSameTypeProductModal';
import AddNewProductModal from './AddNewProductModal';
import { updateOrderProduct, deleteOrderProduct, getAllProducts, addOrderProduct } from '@/lib/api/order';
import { toast } from 'sonner';

interface OrderDetailsProductCardProps {
  order: Order;
}

// Helper function to parse variant string (e.g., "37 - اسود" or just "اسود" or just "37")
function parseVariant(variant: string | null | undefined): { size: string; color: string } {
  if (!variant) {
    return { size: '37', color: 'اسود' };
  }

  // Check if variant contains both size and color (e.g., "37 - اسود")
  if (variant.includes(' - ')) {
    const [size, color] = variant.split(' - ').map(s => s.trim());
    return { size: size || '37', color: color || 'اسود' };
  }

  // Check if it's just a number (size)
  if (/^\d+$/.test(variant.trim())) {
    return { size: variant.trim(), color: 'اسود' };
  }

  // Otherwise, assume it's a color
  return { size: '37', color: variant.trim() };
}

function OrderDetailsProductCard({ order }: OrderDetailsProductCardProps) {
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [isAddSameTypeModalOpen, setIsAddSameTypeModalOpen] = useState(false);
  const [isAddNewProductModalOpen, setIsAddNewProductModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsData, setProductsData] = useState(
    order.order_products?.map((orderProduct) => {
      // Parse the variant to get size and color
      const variantData = parseVariant(orderProduct.variant);
      
      return {
        id: orderProduct.id,
        productId: orderProduct.productId,
        product: orderProduct.products.name,
        // Use variant data if available, otherwise use product defaults
        color: variantData.color || orderProduct.products.color || 'اسود',
        size: variantData.size || orderProduct.products.size || '37',
        price: orderProduct.price,
        img: orderProduct.products.image || '/wireless-headphones.png',
      };
    }) || []
  );

  // Load all products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getAllProducts();
        setAllProducts(products);
      } catch (error) {
        toast.error('فشل في تحميل المنتجات');
      }
    };
    loadProducts();
  }, []);

  const handleEditClick = (productId: number) => {
    setEditingProductId(productId);
  };

  const handleDeleteClick = (productId: number) => {
    setDeletingProductId(productId);
  };

  const handleSaveEdit = async (productId: number, size: string, color: string) => {
    try {
      // Create variant string (format: "size - color")
      const variant = `${size} - ${color}`;
      
      // Call backend API
      await updateOrderProduct(productId, variant);

      // Update local state
      setProductsData((prev) =>
        prev.map((item) =>
          item.id === productId
            ? { ...item, size: size, color: color }
            : item
        )
      );

      toast.success('تم تحديث المنتج بنجاح');
    } catch (error) {
      toast.error('فشل في تحديث المنتج');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;

    try {
      // Call backend API
      await deleteOrderProduct(deletingProductId);

      // Remove from local state
      setProductsData((prev) =>
        prev.filter((item) => item.id !== deletingProductId)
      );

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

  const handleAddSameTypeProduct = async (size: string, color: string, quantity: number) => {
    try {
      // Get the first product as the reference (assuming they all have the same type in this order)
      const referenceProduct = productsData[0];
      if (!referenceProduct) {
        toast.error('لا توجد منتجات في الطلب');
        return;
      }

      const variant = `${size} - ${color}`;
      const price = referenceProduct.price; // Use same price as reference product

      // Add product to order
      const newOrderProduct = await addOrderProduct(
        order.id,
        referenceProduct.productId,
        variant,
        quantity,
        price
      );

      // Add to local state
      const variantData = parseVariant(variant);
      setProductsData((prev) => [
        ...prev,
        {
          id: newOrderProduct.id,
          productId: newOrderProduct.productId,
          product: newOrderProduct.products.name,
          color: variantData.color,
          size: variantData.size,
          price: newOrderProduct.price,
          img: newOrderProduct.products.image || '/wireless-headphones.png',
        },
      ]);

      toast.success('تم إضافة المنتج بنجاح');
    } catch (error) {
      toast.error('فشل في إضافة المنتج');
    }
  };

  const handleAddNewProduct = async (productId: number, size: string, color: string, quantity: number) => {
    try {
      const selectedProduct = allProducts.find(p => p.id === productId);
      if (!selectedProduct) {
        toast.error('المنتج غير موجود');
        return;
      }

      const variant = `${size} - ${color}`;
      const price = selectedProduct.price || 0;

      // Add product to order
      const newOrderProduct = await addOrderProduct(
        order.id,
        productId,
        variant,
        quantity,
        price
      );

      // Add to local state
      const variantData = parseVariant(variant);
      setProductsData((prev) => [
        ...prev,
        {
          id: newOrderProduct.id,
          productId: newOrderProduct.productId,
          product: newOrderProduct.products.name,
          color: variantData.color,
          size: variantData.size,
          price: newOrderProduct.price,
          img: newOrderProduct.products.image || '/wireless-headphones.png',
        },
      ]);

      toast.success('تم إضافة المنتج بنجاح');
    } catch (error) {
      toast.error('فشل في إضافة المنتج');
    }
  };

  return (
    <>
      {/* Header with action buttons */}
      <div className="mt-6 flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddNewProductModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#5D24E1] text-white rounded-lg hover:bg-[#4B1BC4] transition-colors"
            style={{ fontFamily: 'Janna LT' }}
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-bold">إضافة منتج جديد</span>
          </button>
          
          <button
            onClick={() => setIsAddSameTypeModalOpen(true)}
            disabled={productsData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#5D24E1] text-[#5D24E1] rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Janna LT' }}
          >
            <Copy className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-bold">إضافة منتج من نفس النوع</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-[#1E1E1E] font-bold text-lg ">اللون: {item.color}</p>
              <p className="text-[#1E1E1E] font-bold text-lg ">القياس: {item.size}</p>

              <p className="text-[#1E1E1E] font-bold text-lg ">
                {item.price} جنيه
              </p>
            </div>
            <div className="flex flex-col items-end ml-3">
              <div className="flex justify-end gap-2 mb-2">
                <Trash2
                  className="cursor-pointer w-5 text-red-600 hover:text-red-700 transition-colors"
                  onClick={() => handleDeleteClick(item.id)}
                />
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

      {editingProduct && (
        <EditProductModal
          isOpen={editingProductId !== null}
          onClose={() => setEditingProductId(null)}
          onSave={(size, color) => handleSaveEdit(editingProduct.id, size, color)}
          currentSize={editingProduct.size}
          currentColor={editingProduct.color}
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
    </>
  );
}

export default OrderDetailsProductCard;
