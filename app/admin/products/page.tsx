"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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

function ImageSlot({
  index,
  file,
  onChange,
}: {
  index: number;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line2 bg-raised transition-colors hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30"
        aria-label={preview ? `Replace image ${index}` : `Add image ${index}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`Selected image ${index}`} className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-faint transition-colors group-hover:text-muted">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-[11px]">Image {index}</span>
          </span>
        )}
      </button>
      {preview ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-line2 bg-panel text-muted shadow transition-colors hover:text-danger"
          aria-label={`Remove image ${index}`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="rounded-md border border-line2 bg-raised px-2 py-0.5 text-xs text-muted">{s}</span>
      ))}
    </div>
  );
}

export default function AdminProductsPage() {
  const { refresh: refreshShop } = useShop();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [query, setQuery] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
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

  const parsedSizes = useMemo(() => sizesCsv.split(",").map((s) => s.trim()).filter(Boolean), [sizesCsv]);
  const parsedColors = useMemo(() => colorsCsv.split(",").map((s) => s.trim()).filter(Boolean), [colorsCsv]);

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
    const avgPrice = total === 0 ? 0 : products.reduce((sum, p) => sum + p.price, 0) / total;
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
    if (!confirm("Remove this product? This cannot be undone.")) return;

    try {
      const accessToken = await getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
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
      form.set("price", price || "0");
      form.set("category", category);
      form.set("subCategory", subCategory);
      form.set("sizes", JSON.stringify(parsedSizes));
      form.set("colors", JSON.stringify(parsedColors));
      form.set("bestseller", bestseller ? "true" : "false");

      if (image1) form.set("image1", image1);
      if (image2) form.set("image2", image2);
      if (image3) form.set("image3", image3);
      if (image4) form.set("image4", image4);

      const res = await fetch("/api/product/add", { method: "POST", headers, body: form });

      const data = (await res.json()) as BasicResponse;
      if (!data.success) {
        setError(data.message ?? "Failed to add product");
        return;
      }

      setName("");
      setDescription("");
      setPrice("");
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
      <div className="ad-in flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Add, search and retire items in your storefront catalogue.</p>
        <button type="button" onClick={() => void load()} className="ad-btn h-9 self-start px-3.5 py-0 text-xs sm:self-auto">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-faint" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat strip */}
      <div className="ad-card ad-in overflow-hidden" style={{ animationDelay: "40ms" }}>
        <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
          {[
            { label: "Total products", value: String(stats.total) },
            { label: "Bestsellers", value: String(stats.bestsellers) },
            { label: "Average price", value: formatMoney(stats.avgPrice) },
          ].map((s, i) => (
            <div key={s.label} className="bg-panel px-5 py-5">
              <p className="text-xs font-medium text-faint">{s.label}</p>
              {loading ? (
                <div className="ad-shimmer mt-2 h-7 w-20 rounded" />
              ) : (
                <p className={"mt-1.5 text-2xl font-semibold tabular-nums tracking-tight " + (i === 0 ? "text-gold" : "text-ink")}>{s.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div className="ad-in rounded-2xl border border-danger/30 bg-danger/12 px-5 py-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Add product */}
        <section className="lg:col-span-5">
          <div className="ad-card ad-in" style={{ animationDelay: "80ms" }}>
            <div className="border-b border-line px-5 py-4">
              <p className="text-sm font-medium text-ink">Add product</p>
              <p className="text-xs text-muted">Create a new item for the storefront</p>
            </div>

            <form onSubmit={onCreate} className="grid gap-4 px-5 py-5">
              <div className="grid gap-1.5">
                <label className="ad-label">Name</label>
                <input className="ad-input" placeholder="e.g. Water Wave Closure" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="grid gap-1.5">
                <label className="ad-label">Price (GBP)</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-faint">£</span>
                  <input
                    className="ad-input pl-7 tabular-nums"
                    inputMode="decimal"
                    placeholder="199.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="ad-label">Description</label>
                <textarea className="ad-input min-h-28 resize-y" placeholder="Short description for customers" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="ad-label">Category</label>
                  <select className="ad-input" value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="" disabled>Select a category</option>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label className="ad-label">Subcategory</label>
                  <select className="ad-input" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} required>
                    <option value="" disabled>Select a subcategory</option>
                    {PRODUCT_SUBCATEGORY_GROUPS.map((g) => (
                      <optgroup key={g.label} label={g.label}>
                        {g.options.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="ad-label">Sizes <span className="text-faint">(comma separated)</span></label>
                <input className="ad-input" placeholder="e.g. 10 inches, 12 inches, 14 inches" value={sizesCsv} onChange={(e) => setSizesCsv(e.target.value)} required />
                <Chips items={parsedSizes} />
              </div>

              <div className="grid gap-1.5">
                <label className="ad-label">Colors <span className="text-faint">(comma separated)</span></label>
                <input className="ad-input" placeholder="e.g. Natural Black, Honey Blonde" value={colorsCsv} onChange={(e) => setColorsCsv(e.target.value)} required />
                <Chips items={parsedColors} />
              </div>

              <div className="grid gap-1.5">
                <label className="ad-label">Photos <span className="text-faint">(up to 4)</span></label>
                <div className="grid grid-cols-4 gap-2.5">
                  <ImageSlot index={1} file={image1} onChange={setImage1} />
                  <ImageSlot index={2} file={image2} onChange={setImage2} />
                  <ImageSlot index={3} file={image3} onChange={setImage3} />
                  <ImageSlot index={4} file={image4} onChange={setImage4} />
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-raised px-3.5 py-3">
                <span>
                  <span className="block text-sm font-medium text-ink">Mark as bestseller</span>
                  <span className="block text-xs text-muted">Featured on the storefront home page</span>
                </span>
                <input type="checkbox" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} className="h-4 w-4 shrink-0 accent-gold" />
              </label>

              <button className="ad-btn-primary mt-1" type="submit" disabled={creating}>
                {creating ? "Adding…" : "Add product"}
              </button>
            </form>
          </div>
        </section>

        {/* Product list */}
        <section className="lg:col-span-7">
          <div className="ad-card ad-in" style={{ animationDelay: "120ms" }}>
            <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Catalogue</p>
                <p className="text-xs text-muted">{loading ? "Loading…" : `${filteredProducts.length} shown`}</p>
              </div>
              <div className="relative w-full sm:w-72">
                <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.2-3.2" />
                </svg>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="ad-input pl-9" />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="ad-shimmer h-14 w-full rounded-xl" />)}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm font-medium text-ink">{products.length === 0 ? "No products yet" : "No matches"}</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
                  {products.length === 0 ? "Use the form on the left to add your first product — it goes live on the storefront straight away." : "Try a different search term."}
                </p>
              </div>
            ) : (
              <>
                {/* mobile cards */}
                <div className="divide-y divide-line sm:hidden">
                  {filteredProducts.map((p) => (
                    <div key={p._id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-raised">
                            {p.image?.[0] ? <Image src={p.image[0]} alt={p.name} fill className="object-cover" sizes="48px" /> : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                            <p className="truncate text-xs text-faint">{p.category} / {p.subCategory}</p>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-medium tabular-nums text-ink">{formatMoney(p.price)}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        {p.bestseller ? (
                          <span className="ad-pill border-gold/30 bg-gold/12 text-gold">★ Bestseller</span>
                        ) : (
                          <span className="ad-pill border-line2 bg-raised text-muted">Standard</span>
                        )}
                        <button className="ad-btn h-8 px-3 py-0 text-xs text-danger hover:border-danger/40" type="button" onClick={() => void removeProduct(p._id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* desktop table */}
                <div className="ad-scroll hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead>
                      <tr className="text-xs text-faint">
                        <th className="px-5 py-3 text-left font-medium">Product</th>
                        <th className="px-5 py-3 text-left font-medium">Category</th>
                        <th className="px-5 py-3 text-right font-medium">Price</th>
                        <th className="px-5 py-3 text-left font-medium">Flag</th>
                        <th className="px-5 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {filteredProducts.map((p) => (
                        <tr key={p._id} className="transition-colors hover:bg-raised/50">
                          <td className="px-5 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-raised">
                                {p.image?.[0] ? <Image src={p.image[0]} alt={p.name} fill className="object-cover" sizes="44px" /> : null}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-ink">{p.name}</p>
                                <p className="truncate font-mono text-xs text-faint">{p._id.slice(0, 8)}…</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-muted">{p.category} / {p.subCategory}</td>
                          <td className="px-5 py-3 text-right font-medium tabular-nums text-ink">{formatMoney(p.price)}</td>
                          <td className="px-5 py-3">
                            {p.bestseller ? (
                              <span className="ad-pill border-gold/30 bg-gold/12 text-gold">★ Bestseller</span>
                            ) : (
                              <span className="ad-pill border-line2 bg-raised text-muted">Standard</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button className="ad-btn-ghost text-danger hover:text-danger" type="button" onClick={() => void removeProduct(p._id)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
