import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export const getAccessToken = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

export const getUserEmail = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
};

export const signOut = async () => {
  const supabase = createSupabaseBrowserClient();

  try {
    await fetch("/api/auth/signout", { method: "POST" });
  } catch {
    // ignore
  }

  await supabase.auth.signOut();
};
