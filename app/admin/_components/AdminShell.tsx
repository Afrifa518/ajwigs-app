"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { getUserEmail, signOut } from "@/app/admin/_lib/supabase";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => JSX.Element;
};

const IconGrid = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M4 4h7v7H4V4Z" />
    <path d="M13 4h7v7h-7V4Z" />
    <path d="M4 13h7v7H4v-7Z" />
    <path d="M13 13h7v7h-7v-7Z" />
  </svg>
);

const IconTag = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M20 12V7a2 2 0 0 0-2-2h-5L4 14l6 6 10-10Z" />
    <path d="M7 7h.01" />
  </svg>
);

const IconBox = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8Z" />
    <path d="M3.3 7.3 12 12l8.7-4.7" />
    <path d="M12 22V12" />
  </svg>
);

const IconLogOut = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const IconMenu = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
);

const IconX = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: IconGrid },
  { href: "/admin/products", label: "Products", icon: IconBox },
  { href: "/admin/orders", label: "Orders", icon: IconTag },
];

const getPageTitle = (pathname: string) => {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  return "Admin";
};

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const title = useMemo(() => getPageTitle(pathname), [pathname]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const email = await getUserEmail();
        if (mounted) setUserEmail(email);
      } catch {
        if (mounted) setUserEmail(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const Sidebar = ({ variant }: { variant: "desktop" | "mobile" }) => (
    <aside
      className={
        variant === "desktop"
          ? "hidden lg:flex lg:w-72 lg:flex-col lg:gap-6 lg:border-r lg:border-slate-800 lg:bg-slate-950 lg:p-6"
          : "w-[85vw] max-w-72 flex flex-col gap-6 border-r border-slate-800 bg-slate-950 p-6"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500" />
          <div>
            <p className="text-sm text-slate-400">Admin Console</p>
            <p className="text-base font-semibold tracking-tight">El-ROI LUX HAIRS LTD</p>
          </div>
        </div>

        {variant === "mobile" ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/40 text-slate-200"
            aria-label="Close menu"
          >
            <IconX className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="grid gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition " +
                (active
                  ? "bg-slate-900/70 text-white"
                  : "text-slate-300 hover:bg-slate-900/40 hover:text-white")
              }
            >
              <Icon
                className={
                  "h-4 w-4 " +
                  (active ? "text-sky-300" : "text-slate-400 group-hover:text-sky-300")
                }
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-900/40 hover:text-white"
        >
          <span className="h-4 w-4 rounded bg-slate-800" />
          <span className="font-medium">Storefront</span>
        </Link>
      </nav>

      <div className="mt-auto grid gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="truncate text-sm font-medium text-slate-100">
            {userEmail ?? "admin"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void onSignOut()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-900/70"
        >
          <IconLogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        <Sidebar variant="desktop" />

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute left-0 top-0 h-full">
              <Sidebar variant="mobile" />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-100 lg:hidden"
                  aria-label="Open menu"
                >
                  <IconMenu className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-xs text-slate-400">Admin</p>
                  <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="hidden rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 hover:bg-slate-900/70 sm:inline-flex"
                >
                  View storefront
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
