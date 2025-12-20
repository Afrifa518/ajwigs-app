import { NextResponse } from "next/server";
import { ApiError, isApiError } from "@/lib/api-error";
import { getUserOrThrow } from "@/lib/auth/guards";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type IncomingOrderItem = {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  color?: string;
  size?: string;
  image?: string[];
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);

    const body = (await request.json()) as {
      items?: IncomingOrderItem[];
      amount?: number;
      address?: unknown;
    };

    const items = body.items;
    const amount = body.amount;
    const address = body.address;

    if (!Array.isArray(items) || typeof amount !== "number" || !address) {
      throw new ApiError(400, "Invalid order payload");
    }

    const amountPence = Math.round(amount * 100);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        amount_pence: amountPence,
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

    const orderItems = items
      .filter((i) => i && typeof i.name === "string" && typeof i.price === "number")
      .map((i) => ({
        order_id: order.id,
        product_id: (i._id ?? i.id) || null,
        name: i.name as string,
        price_pence: Math.round((i.price as number) * 100),
        quantity: typeof i.quantity === "number" ? i.quantity : 1,
        color:
          typeof i.color === "string" && i.color.trim()
            ? (i.color as string)
            : null,
        size:
          typeof i.size === "string" && i.size.trim() ? (i.size as string) : null,
        image_url:
          Array.isArray(i.image) && typeof i.image[0] === "string"
            ? i.image[0]
            : null,
      }));

    if (orderItems.length) {
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        throw new ApiError(500, itemsError.message);
      }
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
