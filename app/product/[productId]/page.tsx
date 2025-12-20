"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useShop, type Product } from "@/app/providers";
import { assets } from "@/app/storefront/assets";
import RelatedProducts from "@/app/storefront/components/RelatedProducts";

type ProductSingleResponse = {
  success: boolean;
  product?: Product;
  message?: string;
};

export default function ProductPage() {
  const router = useRouter();
  const params = useParams<{ productId: string }>();
  const productId = params.productId;

  const { products, currency, addToCart } = useShop();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const isLegacyProduct = !!product && product.sizes.length === 0;
  const availableColors = useMemo(() => {
    if (!product) return [] as string[];
    return isLegacyProduct ? [] : product.colors;
  }, [isLegacyProduct, product]);

  const availableSizes = useMemo(() => {
    if (!product) return [] as string[];
    return isLegacyProduct ? product.colors : product.sizes;
  }, [isLegacyProduct, product]);

  const productFromList = useMemo(
    () => products.find((p) => p._id === productId) ?? null,
    [products, productId]
  );

  useEffect(() => {
    setError(null);

    if (productFromList) {
      setProduct(productFromList);
      setImage(productFromList.image?.[0] ?? null);
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/product/single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        const data = (await res.json()) as ProductSingleResponse;

        if (!data.success || !data.product) {
          setError(data.message ?? "Product not found");
          return;
        }

        setProduct(data.product);
        setImage(data.product.image?.[0] ?? null);
      } catch (err) {
        console.error(err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      void run();
    }
  }, [productFromList, productId]);

  const onAddToCart = async () => {
    if (!product) return;
    setError(null);

    try {
      if (isLegacyProduct) {
        if (!selectedSize) {
          setError("Select Size");
          return;
        }
        await addToCart(product._id, selectedSize, "");
      } else {
        if (!selectedColor) {
          setError("Select Wig Color");
          return;
        }
        if (!selectedSize) {
          setError("Select Size");
          return;
        }
        await addToCart(product._id, selectedColor, selectedSize);
      }
      router.push("/cart");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to add to cart");
    }
  };

  return (
    <div className="border-t-2 pt-6 sm:pt-10 transition-opacity duration-500 ease-in opacity-100">
      {loading ? <p className="text-sm">Loading...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {product ? (
        <>
          <div className="flex flex-col gap-8 sm:gap-12 lg:flex-row">
            <div className="flex flex-col-reverse flex-1 gap-3 sm:flex-row">
              <div className="flex w-full gap-2 overflow-x-auto pb-2 sm:w-24 sm:flex-col sm:gap-3 sm:overflow-y-auto sm:pb-0">
                {product.image.map((item, index) => (
                  <Image
                    onClick={() => setImage(item)}
                    src={item}
                    key={index}
                    className="h-auto w-24 shrink-0 cursor-pointer border border-gray-200 sm:w-full"
                    alt=""
                    width={200}
                    height={200}
                  />
                ))}
              </div>
              <div className="w-full sm:flex-1">
                {image ? (
                  <Image
                    className="h-auto w-full border border-gray-200"
                    src={image}
                    alt=""
                    width={900}
                    height={900}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    priority
                  />
                ) : null}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="mt-2 break-words text-2xl font-medium sm:text-3xl">{product.name}</h1>
              <div className="flex items-center gap-1 mt-2">
                <Image src={assets.star_icon} alt="" className="w-3.5" />
                <Image src={assets.star_icon} alt="" className="w-3.5" />
                <Image src={assets.star_icon} alt="" className="w-3.5" />
                <Image src={assets.star_icon} alt="" className="w-3.5" />
                <Image src={assets.star_icon} alt="" className="w-3.5" />
              </div>
              <p className="mt-5 text-3xl font-medium">
                {currency}
                {product.price}
              </p>
              <p className="mt-4 text-gray-500 sm:mt-5 md:w-4/5">{product.description}</p>
              <div className="flex flex-col gap-4 my-8">
                {!isLegacyProduct ? (
                  <>
                    <p>Select Color</p>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((item, index) => (
                        <button
                          onClick={() => setSelectedColor(item)}
                          className={`border px-4 py-2 bg-gray-100 text-sm ${
                            item === selectedColor ? "border-orange-500" : ""
                          }`}
                          key={index}
                          type="button"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                <p>Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((item, index) => (
                    <button
                      onClick={() => setSelectedSize(item)}
                      className={`border px-4 py-2 bg-gray-100 text-sm ${
                        item === selectedSize ? "border-orange-500" : ""
                      }`}
                      key={index}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => void onAddToCart()}
                className="w-full px-8 py-3 text-sm text-white bg-black active:bg-gray-700 sm:w-auto"
                type="button"
              >
                ADD TO CART
              </button>
              <hr className="mt-8 sm:w-4/5" />
              <div className="flex flex-col gap-1 mt-5 text-sm text-gray-500">
                <p>100% Quality Wig.</p>
                <p>Cash on delivery is available on this product.</p>
                <p>Easy return and exchange policy within 7 days.</p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="flex">
              <b className="px-5 py-3 text-sm border">Description</b>
            </div>
            <div className="flex flex-col gap-4 px-4 py-4 text-sm text-gray-500 border sm:px-6">
              <p>
                AJ Wigs are designed with precision and care, offering a natural and seamless look for any occasion. Combining comfort, style, and longevity, these wigs provide an effortless way to enhance your beauty and express your individuality.
              </p>
              <p>
                Each wig is crafted to cater to diverse preferences, ensuring you find the perfect match for your unique style and personality. Explore our collection and discover the ideal wig that complements your lifestyle.
              </p>
            </div>
          </div>

          <RelatedProducts category={product.category} subCategory={product.subCategory} />
        </>
      ) : (
        <div className="opacity-0"></div>
      )}
    </div>
  );
}
