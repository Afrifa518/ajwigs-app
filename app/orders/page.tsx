"use client";

import { useEffect, useState } from "react";
import { useShop } from "@/app/providers";
import Title from "@/app/storefront/components/Title";
import Image from "next/image";

type OrderResponse = {
  success: boolean;
  orders?: Array<{
    _id: string;
    status: string;
    paymentMethod: string;
    payment: boolean;
    date: number;
    items: Array<{
      _id: string;
      name: string;
      price: number;
      quantity: number;
      color: string;
      size: string;
      image: string[];
    }>;
  }>;
  message?: string;
};

export default function OrdersPage() {
  const { token, currencyFormat } = useShop();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [orderData, setOrderData] = useState<
    Array<{
      name: string;
      price: number;
      quantity: number;
      color: string;
      size: string;
      image: string[];
      status: string;
      payment: boolean;
      paymentMethod: string;
      date: number;
    }>
  >([]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setOrderData([]);
        setLoading(false);
        setError("Please login to view your orders");
        return;
      }

      try {
        const res = await fetch("/api/order/userorders", {
          method: "POST",
          headers: { token },
        });
        const data = (await res.json()) as OrderResponse;

        if (!data.success) {
          setError(data.message ?? "Failed to load orders");
          return;
        }

        const allOrdersItem: Array<{
          name: string;
          price: number;
          quantity: number;
          color: string;
          size: string;
          image: string[];
          status: string;
          payment: boolean;
          paymentMethod: string;
          date: number;
        }> = [];

        (data.orders ?? []).forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
            });
          });
        });

        setOrderData(allOrdersItem.reverse());
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [token, refreshTick]);

  return (
    <div className="pt-16 border-t">
      <div className="text-2xl">
        <Title text1="MY" text2="ORDERS" />
      </div>

      {loading ? <p className="text-sm">Loading...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div>
        {orderData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 py-4 text-gray-700 border-t border-b md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-6 text-sm">
              {item.image?.[0] ? (
                <Image className="w-16 sm:w-20" src={item.image[0]} alt="" width={160} height={160} />
              ) : null}
              <div>
                <p className="font-medium sm:text-base">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>{currencyFormat.format(item.price)}</p>
                  <p>Quantity: {item.quantity}</p>
                  {item.color ? <p>Color: {item.color}</p> : null}
                  {item.size ? <p>Size: {item.size}</p> : null}
                </div>
                <p className="mt-1">
                  Date: <span className="text-gray-400">{new Date(item.date).toDateString()}</span>
                </p>
                <p className="mt-1">
                  Payment: <span className="text-gray-400">{item.paymentMethod}</span>
                </p>
              </div>
            </div>
            <div className="flex justify-between md:w-1/2">
              <div className="flex items-center gap-2">
                <p className="h-2 bg-green-500 rounded-full min-w-2"></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>
              <button
                onClick={() => {
                  setRefreshTick((t) => t + 1);
                }}
                className="px-4 py-2 text-sm font-medium border rounded-sm"
                type="button"
              >
                Track Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
