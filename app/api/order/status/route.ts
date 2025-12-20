import { NextResponse } from "next/server";
import { ApiError, isApiError } from "@/lib/api-error";
import { assertAdminOrThrow, getUserOrThrow } from "@/lib/auth/guards";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);
    await assertAdminOrThrow(supabase, user.id);

    const body = (await request.json()) as { orderId?: string; status?: string };
    const orderId = body.orderId;
    const status = body.status;

    if (!orderId || !status) {
      throw new ApiError(400, "Missing orderId or status");
    }

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      throw new ApiError(500, error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
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
