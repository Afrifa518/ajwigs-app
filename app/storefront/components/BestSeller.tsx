"use client";

import { useEffect, useState } from "react";
import { useShop, type Product } from "@/app/providers";
import Title from "@/app/storefront/components/Title";
import ProductItem from "@/app/storefront/components/ProductItem";

export default function BestSeller() {
  const { products } = useShop();
  const [bestSeller, setBestSeller] = useState<Product[]>([]);

  useEffect(() => {
    const bestProduct = products.filter((item) => item.bestseller);
    setBestSeller(bestProduct.slice(0, 5));
  }, [products]);

  return (
    <div className="my-10">
      <div className="py-8 text-3xl text-center">
        <Title text1="BEST" text2="SELLERS" />
        <p className="w-3/4 m-auto text-xs text-gray-600 sm:text-sm md:text-base">
          Explore our top-selling wigs that customers can’t get enough of—proven favorites
          for flawless looks every day.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6">
        {bestSeller.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
}
