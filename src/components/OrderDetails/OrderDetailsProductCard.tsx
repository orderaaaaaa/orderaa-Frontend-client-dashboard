import { Trash2, SquarePen } from 'lucide-react';
import { Order } from '@/types/orders';

interface OrderDetailsProductCardProps {
  order: Order;
}

function OrderDetailsProductCard({ order }: OrderDetailsProductCardProps) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {order.items.map((item) => (
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
              {item.productName}
            </h3>
            <p className="text-[#1E1E1E] font-bold text-lg ">{item.color}</p>
            <p className="text-[#1E1E1E] font-bold text-lg ">
              مقاس: {item.size}
            </p>
            <p className="text-[#1E1E1E] font-bold text-lg ">
              الكمية: {item.quantity}
            </p>
            <p className="text-[#1E1E1E] font-bold text-lg ">
              {item.price} جنيه
            </p>
          </div>
          <div className="flex flex-col items-end ml-3">
            <div className="flex justify-end gap-2 mb-2">
              <Trash2 className="cursor-pointer w-5" />
              <SquarePen className="cursor-pointer w-5  " />
            </div>
            <div className="border-1 flex border-[#B8A3EB] rounded-2xl w-[120px] h-[120px] bg-gray-100 items-center justify-center">
              <span className="text-gray-400 text-sm">صورة المنتج</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderDetailsProductCard;
