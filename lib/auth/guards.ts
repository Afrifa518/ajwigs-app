import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api-error";

type ProfileRow = {
  role: "customer" | "admin";
};

export const getUserOrThrow = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new ApiError(401, "Unauthorized");
  }

  return data.user;
};

export const assertAdminOrThrow = async (
  supabase: SupabaseClient,
  userId: string
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new ApiError(403, "Forbidden");
  }

  const profile = data as ProfileRow;
  if (profile.role !== "admin") {
    throw new ApiError(403, "Forbidden");
  }
};
