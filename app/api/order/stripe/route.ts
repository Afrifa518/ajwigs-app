import { NextResponse } from "next/server";
import { ApiError, isApiError } from "@/lib/api-error";
import { getUserOrThrow } from "@/lib/auth/guards";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

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

const currency = "gbp";
const deliveryCharge = 2;

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

    const originHeader = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    const origin = originHeader ?? (host ? `${proto}://${host}` : null);

    if (!origin) {
      throw new ApiError(400, "Missing origin/host header");
    }

    const amountPence = Math.round(amount * 100);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        amount_pence: amountPence,
        currency: "GBP",
        status: "Order Placed",
        payment_method: "Stripe",
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

    const line_items = items
      .filter((i) => i && typeof i.name === "string" && typeof i.price === "number")
      .map((item) => ({
        price_data: {
          currency,
          product_data: {
            name: item.name as string,
          },
          unit_amount: Math.round((item.price as number) * 100),
        },
        quantity: typeof item.quantity === "number" ? item.quantity : 1,
      }));

    line_items.push({
      price_data: {
        currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${order.id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${order.id}`,
      line_items,
      mode: "payment",
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
    });

    const admin = createSupabaseAdminClient();
    const { error: updateError } = await admin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    if (updateError) {
      throw new ApiError(500, updateError.message);
    }

    return NextResponse.json({ success: true, session_url: session.url });
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
