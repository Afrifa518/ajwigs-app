import { NextResponse } from "next/server";
import { ApiError, isApiError } from "@/lib/api-error";
import { getUserOrThrow } from "@/lib/auth/guards";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { assertValidAddress, resolveOrderItems } from "@/lib/orders/pricing";

const currency = "gbp";
const deliveryChargePence = 200;

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

    // Prices/totals are derived server-side from the database; client prices
    // are never trusted (otherwise a tampered request could pay any amount).
    const { items, subtotalPence } = await resolveOrderItems(supabase, body.items);
    const amountPence = subtotalPence + deliveryChargePence;

    const originHeader = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    const origin = originHeader ?? (host ? `${proto}://${host}` : null);

    if (!origin) {
      throw new ApiError(400, "Missing origin/host header");
    }

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

    const orderItems = items.map((i) => ({ ...i, order_id: order.id }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      throw new ApiError(500, itemsError.message);
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price_pence,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery Charges" },
        unit_amount: deliveryChargePence,
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
