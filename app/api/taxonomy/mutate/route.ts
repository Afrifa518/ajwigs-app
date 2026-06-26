import { NextResponse } from "next/server";
import { ApiError, isApiError } from "@/lib/api-error";
import { assertAdminOrThrow, getUserOrThrow } from "@/lib/auth/guards";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";

const TABLES = {
  category: "categories",
  group: "subcategory_groups",
  subcategory: "subcategories",
} as const;

type Entity = keyof typeof TABLES;

const isEntity = (v: unknown): v is Entity =>
  v === "category" || v === "group" || v === "subcategory";

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();

  try {
    const user = await getUserOrThrow(supabase);
    await assertAdminOrThrow(supabase, user.id);

    const body = (await request.json()) as {
      entity?: string;
      op?: string;
      id?: string;
      label?: string;
      groupId?: string;
    };

    if (!isEntity(body.entity)) {
      throw new ApiError(400, "Unknown entity");
    }
    const entity = body.entity;

    if (body.op === "add") {
      const label = (body.label ?? "").trim();
      if (!label) {
        throw new ApiError(400, "A name is required");
      }
      if (label.length > 60) {
        throw new ApiError(400, "Name is too long (max 60 characters)");
      }

      let insertError;
      if (entity === "category") {
        ({ error: insertError } = await supabase
          .from("categories")
          .insert({ value: label, label }));
      } else if (entity === "group") {
        ({ error: insertError } = await supabase
          .from("subcategory_groups")
          .insert({ label }));
      } else {
        if (!body.groupId) {
          throw new ApiError(400, "Missing group");
        }
        ({ error: insertError } = await supabase
          .from("subcategories")
          .insert({ group_id: body.groupId, value: label, label }));
      }

      if (insertError) {
        if (insertError.code === "23505") {
          throw new ApiError(409, `"${label}" already exists`);
        }
        throw new ApiError(500, insertError.message);
      }
    } else if (body.op === "remove") {
      if (!body.id) {
        throw new ApiError(400, "Missing id");
      }
      const { error } = await supabase.from(TABLES[entity]).delete().eq("id", body.id);
      if (error) {
        throw new ApiError(500, error.message);
      }
    } else {
      throw new ApiError(400, "Unknown operation");
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
