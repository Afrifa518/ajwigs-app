import { NextResponse } from "next/server";
import { ApiError, isApiError } from "@/lib/api-error";
import { getUserOrThrow } from "@/lib/auth/guards";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { assertValidAddress, resolveOrderItems } from "@/lib/orders/pricing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);

    const body = (await request.json()) as {
      items?: unknown;
      address?: unknown;
    };

    const address = assertValidAddress(body.address);

    // Prices and totals are computed server-side from the database — the
    // client-supplied amount/prices are ignored.
    const { items, subtotalPence } = await resolveOrderItems(supabase, body.items);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        amount_pence: subtotalPence,
        currency: "GBP",
        status: "Order Placed",
        payment_method: "COD",
        payment: false,
        address,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      throw new ApiError(500, orderError?.message ?? "Failed to create order");
    }

    const orderItems = items.map((i) => ({ ...i, order_id: order.id }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      throw new ApiError(500, itemsError.message);
    }

    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (clearCartError) {
      throw new ApiError(500, clearCartError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
    });
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
