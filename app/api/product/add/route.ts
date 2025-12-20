import crypto from "crypto";
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
  bestseller: boolean;
};

const parseBool = (value: FormDataEntryValue | null): boolean => {
  if (value === null) return false;
  if (typeof value !== "string") return true;
  return value === "true" || value === "on" || value === "1";
};

const parseStringArray = (value: FormDataEntryValue | null): string[] => {
  if (!value) return [];
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
  } catch {
    // ignore
  }

  return [];
};

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);
    await assertAdminOrThrow(supabase, user.id);

    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const priceRaw = formData.get("price");
    const category = formData.get("category");
    const subCategory = formData.get("subCategory");
    const sizesRaw = formData.get("sizes");
    const colorsRaw = formData.get("colors");
    const bestsellerRaw = formData.get("bestseller");

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof priceRaw !== "string" ||
      typeof category !== "string" ||
      typeof subCategory !== "string"
    ) {
      throw new ApiError(400, "Missing required fields");
    }

    const priceNumber = Number(priceRaw);
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      throw new ApiError(400, "Invalid price");
    }

    const parsedSizes = parseStringArray(sizesRaw);
    const parsedColors = parseStringArray(colorsRaw);
    const hasColorsField = colorsRaw !== null;

    const sizes = hasColorsField ? parsedSizes : [];
    const colors = hasColorsField ? parsedColors : parsedSizes;

    if (hasColorsField && (!sizes.length || !colors.length)) {
      throw new ApiError(400, "Missing sizes or colors");
    }
    const bestseller = parseBool(bestsellerRaw);

    const imageUrls: string[] = [];

    for (const key of ["image1", "image2", "image3", "image4"]) {
      const entry = formData.get(key);
      if (!entry) continue;
      if (typeof entry === "string") continue;

      const file = entry as File;
      if (!file.size) continue;

      const bytes = await file.arrayBuffer();
      const blob = new Blob([bytes], {
        type: file.type || "application/octet-stream",
      });
      const objectPath = `${user.id}/${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(objectPath, blob, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        throw new ApiError(500, uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(objectPath);

      if (!publicUrlData.publicUrl) {
        throw new ApiError(500, "Failed to generate public image URL");
      }

      imageUrls.push(publicUrlData.publicUrl);
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
      bestseller,
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
