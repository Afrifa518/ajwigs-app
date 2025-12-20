"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/app/providers";
import { assets } from "@/app/storefront/assets";
import Title from "@/app/storefront/components/Title";
import CartTotal from "@/app/storefront/components/CartTotal";

const parseVariantKey = (variantKey: string) => {
  const raw = variantKey ?? "";
  const idx = raw.indexOf("::");
  if (idx === -1) return { color: raw, size: "" };
  return { color: raw.slice(0, idx), size: raw.slice(idx + 2) };
};

export default function CartPage() {
  const router = useRouter();
  const {
    products,
    cartItems,
    currencyFormat,
    updateQuantity,
  } = useShop();

  const [cartData, setCartData] = useState<
    Array<{ _id: string; variantKey: string; color: string; size: string; quantity: number }>
  >([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData: Array<{
        _id: string;
        variantKey: string;
        color: string;
        size: string;
        quantity: number;
      }> = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const parsed = parseVariantKey(item);
            tempData.push({
              _id: items,
              variantKey: item,
              color: parsed.color,
              size: parsed.size,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  return (
    <div className="border-t pt-14">
      <div className="mb-3 text-2xl">
        <Title text1="YOUR" text2="CART" />
      </div>

      <div>
        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item._id);
          if (!productData) return null;

          return (
            <div
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
              key={index}
            >
              <div className="flex items-start gap-6">
                <Image
                  className="w-16 sm:w-20"
                  src={productData.image[0]}
                  alt=""
                  width={160}
                  height={160}
                />
                <div>
                  <p className="text-xs font-medium sm:text-lg">{productData.name}</p>
                  <div className="flex items-center gap-5 mt-2">
                    <p>{currencyFormat.format(productData.price)}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.size ? (
                        <>
                          <p className="px-2 border sm:px-3 sm:py-1 bg-slate-50">
                            Color: {item.color}
                          </p>
                          <p className="px-2 border sm:px-3 sm:py-1 bg-slate-50">
                            Size: {item.size}
                          </p>
                        </>
                      ) : (
                        <p className="px-2 border sm:px-3 sm:py-1 bg-slate-50">
                          Size: {item.color}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <input
                onChange={(e) =>
                  e.target.value === "" || e.target.value === "0"
                    ? null
                    : void updateQuantity(
                        item._id,
                        item.color,
                        item.size,
                        Number(e.target.value)
                      )
                }
                className="px-1 py-1 border max-w-10 sm:max-w-20 sm:px-2"
                type="number"
                min={1}
                defaultValue={item.quantity}
              />
              <Image
                onClick={() => void updateQuantity(item._id, item.color, item.size, 0)}
                className="w-4 mr-4 cursor-pointer sm:w-5"
                src={assets.bin_icon}
                alt=""
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              onClick={() => router.push("/place-order")}
              className="px-8 py-3 my-8 text-sm text-white bg-black"
              type="button"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
