import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { ApiError, isApiError } from "@/lib/api-error";

type DbProduct = {
  id: string;
  name: string;
  description: string;
  price_pence: number;
  category: string;
  subcategory: string;
  sizes: string[] | null;
  colors: string[] | null;
  image_urls: string[];
  bestseller: boolean;
  created_at: string;
};

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const body = (await request.json()) as { productId?: string };
    const productId = body.productId;

    if (!productId) {
      throw new ApiError(400, "Missing productId");
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,description,price_pence,category,subcategory,sizes,colors,image_urls,bestseller,created_at"
      )
      .eq("id", productId)
      .single();

    if (error || !data) {
      throw new ApiError(404, "Product not found");
    }

    const p = data as DbProduct;
    const product = {
      _id: p.id,
      name: p.name,
      description: p.description,
      price: p.price_pence / 100,
      category: p.category,
      subCategory: p.subcategory,
      sizes: p.sizes ?? [],
      colors: p.colors ?? [],
      bestseller: p.bestseller,
      image: p.image_urls,
      date: new Date(p.created_at).getTime(),
    };

    return NextResponse.json({ success: true, product });
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
