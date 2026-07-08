import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { ApiError, isApiError } from "@/lib/api-error";
import { assertAdminOrThrow, getUserOrThrow } from "@/lib/auth/guards";

export const runtime = "nodejs";

type ProductInsert = {
  name: string;
  description: string;
  price_pence: number;
  category: string;
  subcategory: string;
  sizes: string[];
  colors: string[];
  image_urls: string[];
  video_urls: string[];
  bestseller: boolean;
};

type AddBody = {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  category?: unknown;
  subCategory?: unknown;
  sizes?: unknown;
  colors?: unknown;
  bestseller?: unknown;
  imageUrls?: unknown;
  videoUrls?: unknown;
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];

// Media is uploaded straight from the admin's browser to Supabase Storage (so we
// never hit Vercel's ~4.5 MB request-body limit). The client then sends us the
// resulting public URLs. We only accept URLs that genuinely live in our own
// product-images bucket, so a forged request can't inject arbitrary links.
const publicPrefix = () => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/product-images/`;
};

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);
    await assertAdminOrThrow(supabase, user.id);

    const body = (await request.json()) as AddBody;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const subCategory = typeof body.subCategory === "string" ? body.subCategory.trim() : "";

    if (!name || !description || !category || !subCategory) {
      throw new ApiError(400, "Missing required fields");
    }

    const priceNumber = Number(body.price);
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      throw new ApiError(400, "Invalid price");
    }

    const sizes = asStringArray(body.sizes).map((s) => s.trim()).filter(Boolean);
    const colors = asStringArray(body.colors).map((s) => s.trim()).filter(Boolean);
    if (!sizes.length || !colors.length) {
      throw new ApiError(400, "Missing sizes or colors");
    }

    const prefix = publicPrefix();
    if (!prefix) {
      throw new ApiError(500, "Storage is not configured");
    }

    const validateUrls = (urls: string[], label: string): string[] => {
      for (const url of urls) {
        if (!url.startsWith(prefix)) {
          throw new ApiError(400, `Invalid ${label} URL`);
        }
      }
      return urls;
    };

    const imageUrls = validateUrls(asStringArray(body.imageUrls), "image");
    const videoUrls = validateUrls(asStringArray(body.videoUrls), "video");

    if (!imageUrls.length) {
      throw new ApiError(400, "Add at least one product photo");
    }

    const payload: ProductInsert = {
      name,
      description,
      price_pence: Math.round(priceNumber * 100),
      category,
      subcategory: subCategory,
      sizes,
      colors,
      image_urls: imageUrls,
      video_urls: videoUrls,
      bestseller: body.bestseller === true || body.bestseller === "true",
    };

    const { error: insertError } = await supabase.from("products").insert(payload);

    if (insertError) {
      throw new ApiError(500, insertError.message);
    }

    return NextResponse.json({ success: true, message: "Product added" });
  } catch (err) {
    if (isApiError(err)) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.status }
      );
    }

    console.error(err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
