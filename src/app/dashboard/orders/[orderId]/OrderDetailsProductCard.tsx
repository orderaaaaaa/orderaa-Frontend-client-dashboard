import { Trash2, SquarePen } from 'lucide-react';

const dumymyData = [
  {
    id: 1,
    product: 'منتج 1',
    color: 'red',
    prop: 45,
    price: 50,
    img: '/wireless-headphones.png',
  },
  {
    id: 2,
    product: 'منتج 2',
    color: 'black',
    prop: 45,
    price: 30,
    img: '/wireless-headphones.png',
  },
  {
    id: 3,
    product: 'منتج 3',
    color: 'blue',
    prop: 45,
    price: 20,
    img: '/wireless-headphones.png',
  },
  {
    id: 4,
    product: 'منتج 4',
    color: 'green',
    prop: 45,
    price: 40,
    img: '/wireless-headphones.png',
  },
  {
    id: 5,
    product: 'منتج 5',
    color: 'yellow',
    prop: 45,
    price: 60,
    img: '/wireless-headphones.png',
  },
  {
    id: 6,
    product: 'منتج 6',
    color: 'purple',
    prop: 45,
    price: 70,
    img: '/wireless-headphones.png',
  },
];

function OrderDetailsProductCard() {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {dumymyData.map((item) => (
        <div
          className="grid
            grid-cols-[1fr_1fr]
            gap-5
            max-w-[380px]
            bg-gradient-to-b from-[#FCFAFD] to-[#EADBFF] border-2 border-[#5D24E147]
            rounded-[20px] py-4 px-2
            shadow-[0px_4px_4px_0px_#5D24E114]"
        >
          <div className="flex flex-col gap-2 mx-2">
            {/* TODO: Create a callable component for the repeated elements in the ui folder */}
            <h3 className="text-[#1E1E1E] font-bold text-lg ">
              {item.product}
            </h3>
            <div>
              <p className="text-[#1E1E1E] font-bold text-lg ">{item.color}</p>
              <p className="text-[#1E1E1E] font-bold text-lg ">{item.prop}</p>
            </div>

            <p className="text-[#1E1E1E] font-bold text-lg ">
              {item.price} جنيه
            </p>
          </div>
          <div className="flex flex-col items-end ml-3">
            <div className="flex justify-end gap-2 mb-2">
              <Trash2 className="cursor-pointer w-5" />
              <SquarePen className="cursor-pointer w-5  " />
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
  );
}

export default OrderDetailsProductCard;
