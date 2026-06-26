"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useShop } from "@/app/providers";
import { assets } from "@/app/storefront/assets";
import Logo from "@/app/storefront/components/Logo";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/collection", label: "Wigs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function StorefrontNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { setShowSearch, getCartCount, token, signOut } = useShop();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        setIsAdmin(false);
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id ?? null;
      if (!userId) {
        setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      setIsAdmin(profile?.role === "admin");
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const logout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const cartCount = getCartCount();

  return (
    <>
      <header className="sticky top-0 z-40 w-screen ml-[calc(50%-50vw)] border-b border-[#1c1714]/10 bg-[#F6F2EA]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <Link href="/" aria-label="El-Roi Lux Hairs — home" className="shrink-0 text-[#1c1714]">
          <Logo markClassName="h-9 w-9 sm:h-10 sm:w-10" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative text-[13px] font-medium uppercase tracking-[0.12em] text-[#3a332b] transition-colors hover:text-[#1c1714]"
            >
              {l.label}
              <span
                className={
                  "absolute -bottom-1.5 left-0 h-px bg-[#C8A951] transition-all duration-300 " +
                  (isActive(l.href) ? "w-full" : "w-0 group-hover:w-full")
                }
              />
            </Link>
          ))}
          {token && isAdmin ? (
            <Link
              href="/admin"
              className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#8a6a1f] transition-colors hover:text-[#1c1714]"
            >
              Admin
            </Link>
          ) : null}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={() => setShowSearch((prev) => !prev)}
            aria-label="Search"
            className="text-[#1c1714] transition-opacity hover:opacity-70"
          >
            <Image src={assets.search_icon} className="h-[18px] w-[18px]" alt="" />
          </button>

          <button
            type="button"
            onClick={() => (token ? router.push("/orders") : router.push("/login"))}
            aria-label={token ? "Your account" : "Sign in"}
            className="hidden text-[#1c1714] transition-opacity hover:opacity-70 sm:block"
          >
            <Image src={assets.profile_icon} className="h-[18px] w-[18px]" alt="" />
          </button>

          <Link href="/cart" aria-label="Cart" className="relative text-[#1c1714] transition-opacity hover:opacity-70">
            <Image src={assets.cart_icon} className="h-[18px] w-[18px] min-w-[18px]" alt="" />
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1c1714] px-1 text-[9px] font-semibold text-[#F6F2EA]">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {token ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="hidden rounded-full border border-[#1c1714]/20 px-3.5 py-1.5 text-xs font-medium text-[#1c1714] transition-colors hover:border-[#C8A951] hover:text-[#8a6a1f] sm:inline-flex"
            >
              Log out
            </button>
          ) : null}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="-mr-1 flex h-9 w-9 items-center justify-center text-[#1c1714] sm:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
              <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
            </svg>
          </button>
        </div>
      </div>
      </header>

      {/* Mobile drawer */}
      <div className={"fixed inset-0 z-50 sm:hidden " + (drawer ? "visible" : "invisible pointer-events-none")}>
        <div
          onClick={() => setDrawer(false)}
          className={
            "absolute inset-0 bg-[#1c1714]/40 backdrop-blur-sm transition-opacity duration-300 " +
            (drawer ? "opacity-100" : "opacity-0")
          }
        />
        <aside
          className={
            "absolute right-0 top-0 flex h-full w-[80%] max-w-xs flex-col bg-[#F6F2EA] shadow-2xl transition-transform duration-300 ease-out " +
            (drawer ? "translate-x-0" : "translate-x-full")
          }
        >
          <div className="flex items-center justify-between border-b border-[#1c1714]/10 px-5 py-4">
            <Logo markClassName="h-9 w-9" className="text-[#1c1714]" />
            <button
              type="button"
              onClick={() => setDrawer(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center text-[#1c1714]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col px-2 py-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setDrawer(false)}
                className={
                  "rounded-lg px-3 py-3 font-serif text-lg transition-colors " +
                  (isActive(l.href) ? "text-[#8a6a1f]" : "text-[#1c1714] hover:bg-[#1c1714]/5")
                }
              >
                {l.label}
              </Link>
            ))}
            {token && isAdmin ? (
              <Link href="/admin" onClick={() => setDrawer(false)} className="rounded-lg px-3 py-3 font-serif text-lg text-[#8a6a1f]">
                Admin dashboard
              </Link>
            ) : null}
          </nav>

          <div className="mt-auto border-t border-[#1c1714]/10 p-4">
            {token ? (
              <button
                type="button"
                onClick={() => {
                  setDrawer(false);
                  void logout();
                }}
                className="w-full rounded-full border border-[#1c1714]/20 px-4 py-2.5 text-sm font-medium text-[#1c1714]"
              >
                Log out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setDrawer(false)}
                className="block w-full rounded-full bg-[#1c1714] px-4 py-2.5 text-center text-sm font-medium text-[#F6F2EA]"
              >
                Sign in
              </Link>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
