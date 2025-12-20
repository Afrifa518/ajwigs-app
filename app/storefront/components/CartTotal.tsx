"use client";

import { useShop } from "@/app/providers";
import Title from "@/app/storefront/components/Title";

export default function CartTotal() {
  const { getCartAmount, currencyFormat, delivery_fee } = useShop();

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1="CART" text2="TOTALS" />
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{currencyFormat.format(getCartAmount() ? getCartAmount() : 0)}</p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping fee</p>
          <p>{currencyFormat.format(delivery_fee ? delivery_fee : 0)}</p>
        </div>
        <hr />
        <div className="flex justify-between">
          <b>Total</b>
          <b>
            {getCartAmount() === 0
              ? currencyFormat.format(0)
              : currencyFormat.format(getCartAmount() + delivery_fee)}
          </b>
        </div>
      </div>
    </div>
  );
}
