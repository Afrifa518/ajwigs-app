import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { isApiError } from "@/lib/api-error";
import { getUserOrThrow } from "@/lib/auth/guards";

type CartRow = {
  product_id: string;
  color: string;
  size: string;
  quantity: number;
};

const toCartVariantKey = (color: string, size: string) => {
  const c = (color ?? "").trim();
  const s = (size ?? "").trim();
  return s ? `${c}::${s}` : c;
};

export async function POST() {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);

    const { data, error } = await supabase
      .from("cart_items")
      .select("product_id,color,size,quantity")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const cartData: Record<string, Record<string, number>> = {};

    for (const row of (data ?? []) as CartRow[]) {
      if (!cartData[row.product_id]) {
        cartData[row.product_id] = {};
      }
      const key = toCartVariantKey(row.color, row.size);
      cartData[row.product_id][key] = row.quantity;
    }

    return NextResponse.json({ success: true, cartData });
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
