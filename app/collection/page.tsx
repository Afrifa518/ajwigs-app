"use client";

import { useEffect, useState } from "react";
import { useShop, type Product } from "@/app/providers";
import { assets } from "@/app/storefront/assets";
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORY_GROUPS } from "@/app/storefront/catalog";
import Title from "@/app/storefront/components/Title";
import ProductItem from "@/app/storefront/components/ProductItem";
import Image from "next/image";

export default function CollectionPage() {
  const { products, search, showSearch } = useShop();
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [subCategory, setSubCategory] = useState<string[]>([]);
  const [sortType, setSortType] = useState("relevant");

  const toggleCategory = (value: string) => {
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleSubCategory = (value: string) => {
    setSubCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory));
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    const fpCopy = filterProducts.slice();

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className="flex flex-col gap-1 pt-10 border-t sm:flex-row sm:gap-10">
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 my-2 text-xl cursor-pointer"
        >
          FILTERS
          <Image
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>

        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {PRODUCT_CATEGORIES.map((c) => (
              <p key={c.value} className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  onChange={() => toggleCategory(c.value)}
                  checked={category.includes(c.value)}
                />
                {c.label}
              </p>
            ))}
          </div>
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {PRODUCT_SUBCATEGORY_GROUPS.map((g) => (
              <div key={g.label} className="flex flex-col gap-2">
                <h5 className="font-bold">{g.label}</h5>
                {g.options.map((s) => (
                  <p key={s.value} className="flex gap-2">
                    <input
                      className="w-3"
                      type="checkbox"
                      onChange={() => toggleSubCategory(s.value)}
                      checked={subCategory.includes(s.value)}
                    />
                    {s.label}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between mb-4 text-base sm:text-2xl">
          <Title text1="ALL" text2="WIGS" />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="px-2 text-sm border-2 border-gray-300"
            value={sortType}
          >
            <option value="relevant">Sort by: Popular</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-6">
          {filterProducts.map((item, index) => (
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
    </div>
  );
}
