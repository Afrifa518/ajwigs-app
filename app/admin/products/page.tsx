"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getAccessToken } from "@/app/admin/_lib/supabase";
import { useShop } from "@/app/providers";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SUBCATEGORY_GROUPS,
} from "@/app/storefront/catalog";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  sizes: string[];
  colors: string[];
  bestseller: boolean;
  image: string[];
};

type ProductListResponse = {
  success: boolean;
  products?: Product[];
  message?: string;
};

type BasicResponse = {
  success: boolean;
  message?: string;
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(amount);

export default function AdminProductsPage() {
  const { refresh: refreshShop } = useShop();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [query, setQuery] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("0");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [sizesCsv, setSizesCsv] = useState("");
  const [colorsCsv, setColorsCsv] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image3, setImage3] = useState<File | null>(null);
  const [image4, setImage4] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const parsedSizes = useMemo(() => {
    return sizesCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [sizesCsv]);

  const parsedColors = useMemo(() => {
    return colorsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [colorsCsv]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      if (p._id.toLowerCase().includes(q)) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.category.toLowerCase().includes(q)) return true;
      if (p.subCategory.toLowerCase().includes(q)) return true;
      if (p.description.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [products, query]);

  const stats = useMemo(() => {
    const total = products.length;
    const bestsellers = products.filter((p) => p.bestseller).length;
    const avgPrice =
      total === 0 ? 0 : products.reduce((sum, p) => sum + p.price, 0) / total;
    return { total, bestsellers, avgPrice };
  }, [products]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/product/list");
      const data = (await res.json()) as ProductListResponse;

      if (!data.success) {
        setError(data.message ?? "Failed to load products");
        return;
      }

      setProducts(data.products ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const removeProduct = async (id: string) => {
    setError(null);

    if (!confirm("Remove this product?")) return;

    try {
      const accessToken = await getAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.token = accessToken;

      const res = await fetch("/api/product/remove", {
        method: "POST",
        headers,
        body: JSON.stringify({ id }),
      });

      const data = (await res.json()) as BasicResponse;
      if (!data.success) {
        setError(data.message ?? "Failed to remove product");
        return;
      }

      await Promise.all([load(), refreshShop()]);
    } catch (err) {
      console.error(err);
      setError("Failed to remove product");
    }
  };

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const accessToken = await getAccessToken();
      const headers: Record<string, string> = {};
      if (accessToken) headers.token = accessToken;

      const form = new FormData();
      form.set("name", name);
      form.set("description", description);
      form.set("price", price);
      form.set("category", category);
      form.set("subCategory", subCategory);
      form.set("sizes", JSON.stringify(parsedSizes));
      form.set("colors", JSON.stringify(parsedColors));
      form.set("bestseller", bestseller ? "true" : "false");

      if (image1) form.set("image1", image1);
      if (image2) form.set("image2", image2);
      if (image3) form.set("image3", image3);
      if (image4) form.set("image4", image4);

      const res = await fetch("/api/product/add", {
        method: "POST",
        headers,
        body: form,
      });

      const data = (await res.json()) as BasicResponse;
      if (!data.success) {
        setError(data.message ?? "Failed to add product");
        return;
      }

      setName("");
      setDescription("");
      setPrice("0");
      setCategory("");
      setSubCategory("");
      setSizesCsv("");
      setColorsCsv("");
      setBestseller(false);
      setImage1(null);
      setImage2(null);
      setImage3(null);
      setImage4(null);

      await Promise.all([load(), refreshShop()]);
    } catch (err) {
      console.error(err);
      setError("Failed to add product");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-slate-400">Catalog</p>
          <h2 className="text-xl font-semibold tracking-tight">Products</h2>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900/70"
          >
            Refresh
          </button>
          <Link href="/admin" className="text-sm text-sky-200 hover:text-sky-100">
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-sm text-slate-400">Total products</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-sm text-slate-400">Bestsellers</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.bestsellers}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-sm text-slate-400">Avg price</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{formatMoney(stats.avgPrice)}</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6">
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30">
            <div className="border-b border-slate-800 px-5 py-4">
              <p className="text-sm font-medium">Add product</p>
              <p className="text-xs text-slate-400">Create a new item for the storefront</p>
            </div>

            <form onSubmit={onCreate} className="grid gap-4 px-5 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-xs text-slate-400">Name</label>
                  <input
                    className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    placeholder="e.g. Water Wave Closure"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-slate-400">Price (GBP)</label>
                  <input
                    className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    placeholder="e.g. 199.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-xs text-slate-400">Description</label>
                <textarea
                  className="min-h-28 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  placeholder="Short description for customers"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-xs text-slate-400">Category</label>
                  <select
                    className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-slate-400">Subcategory</label>
                  <select
                    className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select a subcategory
                    </option>
                    {PRODUCT_SUBCATEGORY_GROUPS.map((g) => (
                      <optgroup key={g.label} label={g.label}>
                        {g.options.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-xs text-slate-400">Sizes (comma separated)</label>
                <input
                  className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  placeholder="e.g. 10 inches, 12 inches, 14 inches"
                  value={sizesCsv}
                  onChange={(e) => setSizesCsv(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs text-slate-400">Colors (comma separated)</label>
                <input
                  className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  placeholder="e.g. Natural Black, Honey Blonde"
                  value={colorsCsv}
                  onChange={(e) => setColorsCsv(e.target.value)}
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={bestseller}
                  onChange={(e) => setBestseller(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950/40"
                />
                Mark as bestseller
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-xs text-slate-400">Image 1</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage1(e.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-100"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-slate-400">Image 2</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage2(e.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-100"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-slate-400">Image 3</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage3(e.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-100"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-slate-400">Image 4</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage4(e.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-100"
                  />
                </div>
              </div>

              <button
                className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900/70 disabled:opacity-60"
                type="submit"
                disabled={creating}
              >
                {creating ? "Adding…" : "Add product"}
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30">
            <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Products</p>
                <p className="text-xs text-slate-400">
                  {loading ? "Loading…" : `${filteredProducts.length} shown`}
                </p>
              </div>

              <div className="w-full sm:w-72">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-sm">
                <thead className="text-xs text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Product</th>
                    <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Category</th>
                    <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Price</th>
                    <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Flag</th>
                    <th className="px-3 py-2 text-left font-medium sm:px-5 sm:py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2 sm:px-5 sm:py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40">
                            {p.image?.[0] ? (
                              <Image
                                src={p.image[0]}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-100">{p.name}</p>
                            <p className="truncate text-xs text-slate-500">{p._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-200 sm:px-5 sm:py-3">
                        {p.category} / {p.subCategory}
                      </td>
                      <td className="px-3 py-2 text-slate-200 sm:px-5 sm:py-3">{formatMoney(p.price)}</td>
                      <td className="px-3 py-2 sm:px-5 sm:py-3">
                        {p.bestseller ? (
                          <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">
                            Bestseller
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/40 px-2.5 py-1 text-xs text-slate-300">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 sm:px-5 sm:py-3">
                        <button
                          className="text-sm text-rose-200 hover:text-rose-100"
                          type="button"
                          onClick={() => void removeProduct(p._id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredProducts.length === 0 ? (
                    <tr>
                      <td className="px-3 py-8 text-sm text-slate-400 sm:px-5" colSpan={5}>
                        No products match your search.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
