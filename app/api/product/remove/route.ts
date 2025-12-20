import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { ApiError, isApiError } from "@/lib/api-error";
import { assertAdminOrThrow, getUserOrThrow } from "@/lib/auth/guards";

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);
    await assertAdminOrThrow(supabase, user.id);

    const body = (await request.json()) as { id?: string };
    const id = body.id;

    if (!id) {
      throw new ApiError(400, "Missing id");
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      throw new ApiError(500, error.message);
    }

    return NextResponse.json({ success: true, message: "Product removed" });
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
