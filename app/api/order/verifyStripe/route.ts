import { NextResponse } from "next/server";
import { ApiError, isApiError } from "@/lib/api-error";
import { getUserOrThrow } from "@/lib/auth/guards";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type OrderRow = {
  id: string;
  user_id: string;
  stripe_session_id: string | null;
  payment_method: string;
};

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);

    const body = (await request.json()) as {
      orderId?: string;
      success?: string;
    };

    const orderId = body.orderId;
    const success = body.success;

    if (!orderId || typeof success !== "string") {
      throw new ApiError(400, "Missing orderId or success");
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,user_id,stripe_session_id,payment_method")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new ApiError(404, "Order not found");
    }

    const o = order as OrderRow;
    if (o.user_id !== user.id) {
      throw new ApiError(403, "Forbidden");
    }

    if (o.payment_method !== "Stripe") {
      throw new ApiError(400, "Order is not a Stripe order");
    }

    const admin = createSupabaseAdminClient();

    if (success !== "true") {
      const { error: deleteError } = await admin
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (deleteError) {
        throw new ApiError(500, deleteError.message);
      }

      return NextResponse.json({
        success: false,
        message: "Payment failed",
      });
    }

    if (!o.stripe_session_id) {
      throw new ApiError(400, "Missing stripe_session_id for order");
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(o.stripe_session_id);

    if (session.metadata?.orderId && session.metadata.orderId !== orderId) {
      throw new ApiError(400, "Stripe session does not match order");
    }

    const paid = session.payment_status === "paid";

    if (!paid) {
      const { error: deleteError } = await admin
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (deleteError) {
        throw new ApiError(500, deleteError.message);
      }

      return NextResponse.json({
        success: false,
        message: "Payment not completed",
      });
    }

    const { error: payError } = await admin
      .from("orders")
      .update({ payment: true })
      .eq("id", orderId);

    if (payError) {
      throw new ApiError(500, payError.message);
    }

    const { error: clearCartError } = await admin
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (clearCartError) {
      throw new ApiError(500, clearCartError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Payment successful",
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
