import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api-error";

/**
 * An order line item as it arrives from the browser. Only the product
 * reference, variant (color/size) and quantity are trusted — the price and
 * name are re-derived from the database so a tampered client cannot set its
 * own prices.
 */
export type IncomingOrderItem = {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  color?: string;
  size?: string;
  image?: string[];
};

export type ResolvedOrderItem = {
  product_id: string;
  name: string;
  price_pence: number;
  quantity: number;
  color: string | null;
  size: string | null;
  image_url: string | null;
};

const MAX_QTY_PER_ITEM = 999;

/**
 * Resolves a client cart into trusted order items priced from the database,
 * and returns the authoritative subtotal in pence. Throws ApiError on any
 * invalid / unavailable item so the caller can surface a clean message.
 */
export const resolveOrderItems = async (
  supabase: SupabaseClient,
  items: unknown
): Promise<{ items: ResolvedOrderItem[]; subtotalPence: number }> => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  const incoming = items as IncomingOrderItem[];

  const ids = Array.from(
    new Set(
      incoming
        .map((i) => i?._id ?? i?.id)
        .filter((x): x is string => typeof x === "string" && x.length > 0)
    )
  );

  if (ids.length === 0) {
    throw new ApiError(400, "Invalid cart items");
  }

  const { data, error } = await supabase
    .from("products")
    .select("id,name,price_pence,image_urls")
    .in("id", ids);

  if (error) {
    throw new ApiError(500, error.message);
  }

  type ProductRow = {
    id: string;
    name: string;
    price_pence: number;
    image_urls: string[] | null;
  };

  const byId = new Map<string, ProductRow>(
    ((data ?? []) as ProductRow[]).map((p) => [p.id, p])
  );

  const resolved: ResolvedOrderItem[] = [];
  let subtotalPence = 0;

  for (const i of incoming) {
    const productId = i?._id ?? i?.id;
    if (!productId) {
      throw new ApiError(400, "A cart item is missing its product reference");
    }

    const product = byId.get(productId);
    if (!product) {
      throw new ApiError(400, "A product in your cart is no longer available");
    }

    const quantity = Math.floor(typeof i.quantity === "number" ? i.quantity : 1);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
      throw new ApiError(400, "Invalid item quantity");
    }

    // Price and name come from the DB, never from the request body.
    subtotalPence += product.price_pence * quantity;

    resolved.push({
      product_id: product.id,
      name: product.name,
      price_pence: product.price_pence,
      quantity,
      color: typeof i.color === "string" && i.color.trim() ? i.color : null,
      size: typeof i.size === "string" && i.size.trim() ? i.size : null,
      image_url:
        Array.isArray(product.image_urls) && typeof product.image_urls[0] === "string"
          ? product.image_urls[0]
          : null,
    });
  }

  return { items: resolved, subtotalPence };
};

/** Validates the incoming address is a non-empty object. */
export const assertValidAddress = (address: unknown): Record<string, unknown> => {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    throw new ApiError(400, "A delivery address is required");
  }
  if (Object.keys(address as Record<string, unknown>).length === 0) {
    throw new ApiError(400, "A delivery address is required");
  }
  return address as Record<string, unknown>;
};
