import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { ApiError, isApiError } from "@/lib/api-error";
import { getUserOrThrow } from "@/lib/auth/guards";

type CartRow = {
  quantity: number;
};

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);

    const body = (await request.json()) as {
      itemId?: string;
      color?: string;
      size?: string;
    };
    const itemId = body.itemId;
    const color = body.color;
    const size = body.size ?? "";

    if (!itemId || !color) {
      throw new ApiError(400, "Missing itemId or color");
    }

    const { data: existing, error: existingError } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("product_id", itemId)
      .eq("color", color)
      .eq("size", size)
      .maybeSingle();

    if (existingError) {
      throw new ApiError(500, existingError.message);
    }

    const existingQty = (existing as CartRow | null)?.quantity ?? 0;
    const nextQty = existingQty + 1;

    const { error: upsertError } = await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        product_id: itemId,
        color,
        size,
        quantity: nextQty,
      },
      { onConflict: "user_id,product_id,color,size" }
    );

    if (upsertError) {
      throw new ApiError(500, upsertError.message);
    }

    return NextResponse.json({ success: true });
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
