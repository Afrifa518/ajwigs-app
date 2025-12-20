"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useShop } from "@/app/providers";
import Title from "@/app/storefront/components/Title";
import CartTotal from "@/app/storefront/components/CartTotal";
import { assets } from "@/app/storefront/assets";
import Image from "next/image";

const parseVariantKey = (variantKey: string) => {
  const raw = variantKey ?? "";
  const idx = raw.indexOf("::");
  if (idx === -1) return { color: raw, size: "" };
  return { color: raw.slice(0, idx), size: raw.slice(idx + 2) };
};

type BasicResponse = {
  success: boolean;
  message?: string;
};

type StripeResponse = {
  success: boolean;
  session_url?: string;
  message?: string;
};

type Address = {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phone: string;
};

export default function PlaceOrderPage() {
  const router = useRouter();

  const {
    products,
    cartItems,
    token,
    delivery_fee,
    getCartAmount,
    refresh,
  } = useShop();

  const [method, setMethod] = useState<"stripe" | "cod">("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Address>({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const cartData = useMemo(() => {
    const temp: Array<{
      _id: string;
      variantKey: string;
      color: string;
      size: string;
      quantity: number;
    }> = [];
    for (const id in cartItems) {
      for (const variantKey in cartItems[id]) {
        const quantity = cartItems[id][variantKey];
        if (quantity > 0) {
          const parsed = parseVariantKey(variantKey);
          temp.push({
            _id: id,
            variantKey,
            color: parsed.color,
            size: parsed.size,
            quantity,
          });
        }
      }
    }
    return temp;
  }, [cartItems]);

  const orderItems = useMemo(() => {
    return cartData
      .map((c) => {
        const product = products.find((p) => p._id === c._id);
        if (!product) return null;

        const isLegacyProduct = product.sizes.length === 0;
        const color = isLegacyProduct ? "" : c.color;
        const size = isLegacyProduct ? c.color : c.size;

        return {
          ...structuredClone(product),
          color,
          size,
          quantity: c.quantity,
        };
      })
      .filter(Boolean);
  }, [cartData, products]);

  const amount = getCartAmount() + delivery_fee;

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof Address;
    setFormData((p) => ({ ...p, [name]: e.target.value }));
  };

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Please login to place an order");
      return;
    }

    if (!orderItems.length) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        token,
      };

      const orderData = {
        address: formData,
        items: orderItems,
        amount,
      };

      if (method === "cod") {
        const res = await fetch("/api/order/place", {
          method: "POST",
          headers,
          body: JSON.stringify(orderData),
        });

        const data = (await res.json()) as BasicResponse;

        if (!data.success) {
          setError(data.message ?? "Failed to place order");
          return;
        }

        await refresh();
        router.push("/orders");
        router.refresh();
        return;
      }

      const res = await fetch("/api/order/stripe", {
        method: "POST",
        headers,
        body: JSON.stringify(orderData),
      });

      const data = (await res.json()) as StripeResponse;

      if (!data.success || !data.session_url) {
        setError(data.message ?? "Failed to create Stripe session");
        return;
      }

      window.location.replace(data.session_url);
    } catch (err) {
      console.error(err);
      setError("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="my-3 text-xl sm:text-2xl">
          <Title text1="DELIVERY" text2="INFORMATION" />
        </div>

        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First name"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last name"
          />
        </div>

        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
        />
        <input
          required
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
        />
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            required
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Postal code"
          />
          <input
            required
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1="PAYMENT" text2="METHOD" />
          <div className="flex flex-col gap-3 lg:flex-row">
            <div
              onClick={() => setMethod("stripe")}
              className="flex items-center gap-3 p-2 px-3 border cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "stripe" ? "bg-green-400" : ""
                }`}
              ></p>
              <Image className="h-5 mx-4" src={assets.stripe_logo} alt="" />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 p-2 px-3 border cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="mx-4 text-sm font-medium text-gray-500">CASH ON DELIVERY</p>
            </div>
          </div>
          <div className="w-full mt-8 text-end">
            <button type="submit" className="px-16 py-3 text-sm text-white bg-black" disabled={loading}>
              {loading ? "PROCESSING..." : "PLACE ORDER"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
