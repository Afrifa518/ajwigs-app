import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  // The storefront must never depend on Supabase being reachable. If the
  // project is paused/unreachable, `getUser()` would otherwise hang until the
  // Edge middleware times out (504 on EVERY route). We race every Supabase call
  // against a short deadline and treat a failure/timeout as "no session": public
  // pages render logged-out, and admin routes fall back to the login redirect.
  const withTimeout = <T,>(p: PromiseLike<T>, ms = 3000): Promise<T | null> =>
    Promise.race([
      Promise.resolve(p),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ]).catch(() => null);

  let user: { id: string } | null = null;
  try {
    const res = await withTimeout(supabase.auth.getUser());
    user = res?.data?.user ?? null;
  } catch {
    user = null;
  }

  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const profileRes = await withTimeout(
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    );

    // If we couldn't verify the role (DB down or genuinely not an admin), keep
    // the admin area locked — send them back to the storefront.
    if (!profileRes || profileRes.error || profileRes.data?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
