"use client";

import { useEffect, useState } from "react";
import { useShop, type Product } from "@/app/providers";
import { assets } from "@/app/storefront/assets";
import { fetchTaxonomy, FALLBACK_TAXONOMY, type Taxonomy } from "@/lib/taxonomy";
import Title from "@/app/storefront/components/Title";
import ProductItem from "@/app/storefront/components/ProductItem";
import Image from "next/image";

export default function CollectionPage() {
  const { products, search, showSearch, currency } = useShop();
  const [taxonomy, setTaxonomy] = useState<Taxonomy>(FALLBACK_TAXONOMY);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [subCategory, setSubCategory] = useState<string[]>([]);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
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

  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setBestsellerOnly(false);
    setPriceMin("");
    setPriceMax("");
  };

  const hasActiveFilters =
    category.length > 0 ||
    subCategory.length > 0 ||
    bestsellerOnly ||
    priceMin !== "" ||
    priceMax !== "";

  useEffect(() => {
    void fetchTaxonomy().then(setTaxonomy);
  }, []);

  useEffect(() => {
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

    if (bestsellerOnly) {
      productsCopy = productsCopy.filter((item) => item.bestseller);
    }

    const min = parseFloat(priceMin);
    if (!Number.isNaN(min)) {
      productsCopy = productsCopy.filter((item) => item.price >= min);
    }

    const max = parseFloat(priceMax);
    if (!Number.isNaN(max)) {
      productsCopy = productsCopy.filter((item) => item.price <= max);
    }

    if (sortType === "low-high") {
      productsCopy.sort((a, b) => a.price - b.price);
    } else if (sortType === "high-low") {
      productsCopy.sort((a, b) => b.price - a.price);
    }

    setFilterProducts(productsCopy);
  }, [
    category,
    subCategory,
    bestsellerOnly,
    priceMin,
    priceMax,
    sortType,
    search,
    showSearch,
    products,
  ]);

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
            {taxonomy.categories.map((c) => (
              <label key={c.id ?? c.value} className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  onChange={() => toggleCategory(c.value)}
                  checked={category.includes(c.value)}
                />
                {c.label}
              </label>
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
            {taxonomy.groups.map((g) => (
              <div key={g.id ?? g.label} className="flex flex-col gap-2">
                <h5 className="font-bold">{g.label}</h5>
                {g.options.map((s) => (
                  <label key={s.id ?? s.value} className="flex gap-2 cursor-pointer">
                    <input
                      className="w-3"
                      type="checkbox"
                      onChange={() => toggleSubCategory(s.value)}
                      checked={subCategory.includes(s.value)}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`border border-gray-300 px-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">PRICE ({currency})</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Min"
              className="w-full border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-500"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max"
              className="w-full border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-light text-gray-700">
            <input
              type="checkbox"
              className="w-3"
              checked={bestsellerOnly}
              onChange={(e) => setBestsellerOnly(e.target.checked)}
            />
            Bestsellers only
          </label>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-xs uppercase tracking-wide text-gray-500 underline underline-offset-2 hover:text-gray-800"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-baseline gap-3 text-base sm:text-2xl">
            <Title text1="ALL" text2="WIGS" />
            <span className="text-xs font-light text-gray-500 sm:text-sm">
              {filterProducts.length} {filterProducts.length === 1 ? "item" : "items"}
            </span>
          </div>
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="px-2 py-1 text-sm border-2 border-gray-300"
            value={sortType}
          >
            <option value="relevant">Sort by: Popular</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {filterProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 px-6 py-20 text-center">
            <p className="text-base font-medium text-gray-700">No wigs match your filters</p>
            <p className="max-w-sm text-sm text-gray-500">
              {products.length === 0
                ? "Our collection is being updated — please check back soon."
                : "Try removing a filter or widening your price range."}
            </p>
            {hasActiveFilters && products.length > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 bg-black px-6 py-2 text-sm text-white active:bg-gray-700"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-6">
            {filterProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
