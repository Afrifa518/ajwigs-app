import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

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

export async function GET() {
  const supabase = createSupabaseRouteHandlerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,description,price_pence,category,subcategory,sizes,colors,image_urls,bestseller,created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  const products = ((data ?? []) as DbProduct[]).map((p) => ({
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
  }));

  return NextResponse.json({ success: true, products });
}
