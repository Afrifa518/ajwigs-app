import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function POST() {
  const supabase = createSupabaseRouteHandlerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
