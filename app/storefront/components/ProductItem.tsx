"use client";

import Image from "next/image";
import Link from "next/link";
import { useShop } from "@/app/providers";

type Props = {
  id: string;
  image: string[];
  name: string;
  price: number;
};

export default function ProductItem({ id, image, name, price }: Props) {
  const { currency } = useShop();

  return (
    <Link className="text-gray-700 cursor-pointer" href={`/product/${id}`}>
      <div className="overflow-hidden">
        {image?.[0] ? (
          <Image
            className="hover:scale-110 transition ease-in-out"
            src={image[0]}
            alt={name}
            width={600}
            height={600}
          />
        ) : null}
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">
        {currency}
        {price}
      </p>
    </Link>
  );
}
