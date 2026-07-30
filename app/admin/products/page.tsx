"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useShop } from "@/app/providers";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchTaxonomy, FALLBACK_TAXONOMY, type Taxonomy } from "@/lib/taxonomy";

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
  video?: string[];
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

const MAX_IMAGE_BYTES = 40 * 1024 * 1024; // 40 MB per photo (auto-compressed before upload)
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB per video
const STORAGE_BUCKET = "product-images";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(amount);

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Downscale/re-encode large photos in the browser before upload. Phone photos
// (and HEIC) are often 5-15 MB; shrinking them to <=2000px JPEG keeps uploads
// fast, well under storage limits, and fixes HEIC display. Falls back to the
// original file if the browser can't decode it, so nothing ever breaks here.
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const maxDim = 2000;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82)
    );
    bitmap.close?.();
    if (!blob) return file;
    if (scale === 1 && blob.size >= file.size) return file; // no real gain
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

// A single selected file, shown as a live local preview before upload.
function MediaTile({
  file,
  kind,
  index,
  onRemove,
}: {
  file: File;
  kind: "image" | "video";
  index: number;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-line2 bg-raised">
      {url ? (
        kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
        ) : (
          <>
            <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-3.5 w-3.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </>
        )
      ) : null}

      <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-3 text-[10px] text-white/90">
        {formatBytes(file.size)}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white opacity-0 shadow backdrop-blur-sm transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
        aria-label={`Remove ${kind} ${index + 1}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// A reusable uploader: a wrapping grid of thumbnails + a dashed "add" tile that
// opens a multi-select file picker. No fixed count — add as many as needed.
function MediaUploader({
  kind,
  label,
  hint,
  accept,
  files,
  disabled,
  onAdd,
  onRemoveAt,
}: {
  kind: "image" | "video";
  label: string;
  hint: string;
  accept: string;
  files: File[];
  disabled: boolean;
  onAdd: (files: File[]) => void;
  onRemoveAt: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid gap-1.5">
      <label className="ad-label flex items-center justify-between">
        <span>
          {label} <span className="text-faint">({hint})</span>
        </span>
        {files.length > 0 ? (
          <span className="text-faint">{files.length} selected</span>
        ) : null}
      </label>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {files.map((file, i) => (
          <MediaTile
            key={`${file.name}-${file.size}-${file.lastModified}-${i}`}
            file={file}
            kind={kind}
            index={i}
            onRemove={() => onRemoveAt(i)}
          />
        ))}

        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="group flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line2 bg-raised text-faint transition-colors hover:border-gold/60 hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Add ${kind === "image" ? "photos" : "videos"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="text-[11px]">{files.length > 0 ? "Add more" : `Add ${kind === "image" ? "photos" : "videos"}`}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        onChange={(e) => {
          onAdd(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
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
  const [taxonomy, setTaxonomy] = useState<Taxonomy>(FALLBACK_TAXONOMY);

  const [query, setQuery] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [sizesCsv, setSizesCsv] = useState("");
  const [colorsCsv, setColorsCsv] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

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
    void fetchTaxonomy().then(setTaxonomy);
  }, []);

  const removeProduct = async (id: string) => {
    setError(null);
    if (!confirm("Remove this product? This cannot be undone.")) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: sess } = await supabase.auth.getSession();
      const accessToken = sess.session?.access_token ?? null;
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

  const addImages = (incoming: File[]) => {
    const valid: File[] = [];
    for (const f of incoming) {
      if (!f.type.startsWith("image/")) {
        setError(`"${f.name}" isn't an image and was skipped.`);
        continue;
      }
      if (f.size > MAX_IMAGE_BYTES) {
        setError(`"${f.name}" is over 40 MB and was skipped.`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length) setImages((prev) => [...prev, ...valid]);
  };

  const addVideos = (incoming: File[]) => {
    const valid: File[] = [];
    for (const f of incoming) {
      if (!f.type.startsWith("video/")) {
        setError(`"${f.name}" isn't a video and was skipped.`);
        continue;
      }
      if (f.size > MAX_VIDEO_BYTES) {
        setError(`"${f.name}" is over 50 MB and was skipped.`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length) setVideos((prev) => [...prev, ...valid]);
  };

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError("Add at least one product photo.");
      return;
    }

    setCreating(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      const accessToken = sess.session?.access_token ?? null;

      if (!uid || !accessToken) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const total = images.length + videos.length;
      let done = 0;
      setProgress({ done, total });

      // Upload each file straight to Supabase Storage from the browser. This
      // avoids Vercel's ~4.5 MB request-body limit entirely, so photos and
      // videos of any reasonable size go through.
      const uploadOne = async (file: File): Promise<string> => {
        const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
        const path = `${uid}/${crypto.randomUUID()}${ext ? "." + ext : ""}`;

        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });

        if (upErr) {
          const m = (upErr.message || "").toLowerCase();
          if (m.includes("exceeded") || m.includes("maximum allowed size") || m.includes("too large") || m.includes("413"))
            throw new Error(`"${file.name}" is too large to upload — try a smaller file (long videos are the usual cause).`);
          if (m.includes("row-level security") || m.includes("permission") || m.includes("not authorized") || m.includes("unauthorized"))
            throw new Error("Upload was blocked — please sign out, sign back in, and try again.");
          if (m.includes("quota") || m.includes("exceeded the storage") || (m.includes("storage") && m.includes("full")))
            throw new Error("Storage is full on the current plan — old media needs removing or the plan upgrading.");
          throw new Error(`Couldn't upload "${file.name}": ${upErr.message}`);
        }

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        if (!data.publicUrl) throw new Error("Could not generate a public URL for an upload.");

        done += 1;
        setProgress({ done, total });
        return data.publicUrl;
      };

      const imageUrls: string[] = [];
      for (const file of images) imageUrls.push(await uploadOne(await compressImage(file)));

      const videoUrls: string[] = [];
      for (const file of videos) videoUrls.push(await uploadOne(file));

      setProgress(null);

      const res = await fetch("/api/product/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", token: accessToken },
        body: JSON.stringify({
          name,
          description,
          price: price || "0",
          category,
          subCategory,
          sizes: parsedSizes,
          colors: parsedColors,
          bestseller,
          imageUrls,
          videoUrls,
        }),
      });

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
      setImages([]);
      setVideos([]);

      await Promise.all([load(), refreshShop()]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setCreating(false);
      setProgress(null);
    }
  };

  const submitLabel = creating
    ? progress
      ? `Uploading ${progress.done}/${progress.total}…`
      : "Saving…"
    : "Add product";

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
                    {taxonomy.categories.map((c) => (
                      <option key={c.id ?? c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label className="ad-label">Subcategory</label>
                  <select className="ad-input" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} required>
                    <option value="" disabled>Select a subcategory</option>
                    {taxonomy.groups.map((g) => (
                      <optgroup key={g.id ?? g.label} label={g.label}>
                        {g.options.map((s) => (
                          <option key={s.id ?? s.value} value={s.value}>{s.label}</option>
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

              <MediaUploader
                kind="image"
                label="Photos"
                hint="add as many as you like · up to 15 MB each"
                accept="image/*"
                files={images}
                disabled={creating}
                onAdd={addImages}
                onRemoveAt={(i) => setImages((prev) => prev.filter((_, idx) => idx !== i))}
              />

              <MediaUploader
                kind="video"
                label="Videos"
                hint="optional · up to 50 MB each"
                accept="video/*"
                files={videos}
                disabled={creating}
                onAdd={addVideos}
                onRemoveAt={(i) => setVideos((prev) => prev.filter((_, idx) => idx !== i))}
              />

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-raised px-3.5 py-3">
                <span>
                  <span className="block text-sm font-medium text-ink">Mark as bestseller</span>
                  <span className="block text-xs text-muted">Featured on the storefront home page</span>
                </span>
                <input type="checkbox" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} className="h-4 w-4 shrink-0 accent-gold" />
              </label>

              <button className="ad-btn-primary mt-1" type="submit" disabled={creating}>
                {submitLabel}
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
                        <div className="flex items-center gap-1.5">
                          {p.bestseller ? (
                            <span className="ad-pill border-gold/30 bg-gold/12 text-gold">★ Bestseller</span>
                          ) : (
                            <span className="ad-pill border-line2 bg-raised text-muted">Standard</span>
                          )}
                          {p.video && p.video.length > 0 ? (
                            <span className="ad-pill border-line2 bg-raised text-muted">▶ {p.video.length}</span>
                          ) : null}
                        </div>
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
                        <th className="px-5 py-3 text-left font-medium">Media</th>
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
                          <td className="px-5 py-3 text-muted">
                            <span className="tabular-nums">{p.image?.length ?? 0} photo{(p.image?.length ?? 0) === 1 ? "" : "s"}</span>
                            {p.video && p.video.length > 0 ? (
                              <span className="tabular-nums text-gold"> · {p.video.length} video{p.video.length === 1 ? "" : "s"}</span>
                            ) : null}
                          </td>
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
