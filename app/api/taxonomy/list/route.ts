import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";

type CategoryRow = { id: string; value: string; label: string };
type GroupRow = { id: string; label: string };
type SubRow = { id: string; group_id: string; value: string; label: string };

export async function GET() {
  const supabase = createSupabaseRouteHandlerClient();

  const [catsRes, groupsRes, subsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id,value,label,sort_order")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true }),
    supabase
      .from("subcategory_groups")
      .select("id,label,sort_order")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true }),
    supabase
      .from("subcategories")
      .select("id,group_id,value,label,sort_order")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true }),
  ]);

  const err = catsRes.error ?? groupsRes.error ?? subsRes.error;
  if (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }

  const categories = ((catsRes.data ?? []) as CategoryRow[]).map((c) => ({
    id: c.id,
    value: c.value,
    label: c.label,
  }));

  const subsByGroup = new Map<string, Array<{ id: string; value: string; label: string }>>();
  for (const s of (subsRes.data ?? []) as SubRow[]) {
    const arr = subsByGroup.get(s.group_id) ?? [];
    arr.push({ id: s.id, value: s.value, label: s.label });
    subsByGroup.set(s.group_id, arr);
  }

  const groups = ((groupsRes.data ?? []) as GroupRow[]).map((g) => ({
    id: g.id,
    label: g.label,
    options: subsByGroup.get(g.id) ?? [],
  }));

  return NextResponse.json({ success: true, categories, groups });
}
