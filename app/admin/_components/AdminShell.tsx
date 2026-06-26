"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { getUserEmail, signOut } from "@/app/admin/_lib/supabase";
import logo from "@/frontend/src/assets/logo.png";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => JSX.Element;
};

const IconGrid = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h7v7H4V4Z" />
    <path d="M13 4h7v7h-7V4Z" />
    <path d="M4 13h7v7H4v-7Z" />
    <path d="M13 13h7v7h-7v-7Z" />
  </svg>
);

const IconTag = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V7a2 2 0 0 0-2-2h-5L4 14l6 6 10-10Z" />
    <path d="M7 7h.01" />
  </svg>
);

const IconBox = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8Z" />
    <path d="M3.3 7.3 12 12l8.7-4.7" />
    <path d="M12 22V12" />
  </svg>
);

const IconLayers = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 12 9 5 9-5" />
    <path d="m3 16 9 5 9-5" />
  </svg>
);

const IconStore = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5 4.5 4h15L21 9.5" />
    <path d="M4 9.5h16V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z" />
    <path d="M3 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 5 0" />
  </svg>
);

const IconLogOut = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const IconMenu = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
);

const IconX = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const IconSun = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const IconMoon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: IconGrid },
  { href: "/admin/products", label: "Products", icon: IconBox },
  { href: "/admin/categories", label: "Categories", icon: IconLayers },
  { href: "/admin/orders", label: "Orders", icon: IconTag },
];

const getPageTitle = (pathname: string) => {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/categories")) return "Categories";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  return "Admin";
};

const Wordmark = () => (
  <div className="flex min-w-0 items-center gap-3">
    <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line2 bg-raised">
      <Image src={logo} alt="El-ROI Lux Hairs" width={40} height={40} className="h-full w-full object-cover" />
    </span>
    <span className="min-w-0">
      <span className="block truncate font-serif text-base leading-tight text-ink">El-ROI Lux Hairs</span>
      <span className="block text-[11px] uppercase tracking-[0.18em] text-gold-dim">Admin Console</span>
    </span>
  </div>
);

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [dark, setDark] = useState(false);
  const title = useMemo(() => getPageTitle(pathname), [pathname]);

  // Initialise theme from saved preference, falling back to the OS setting.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ad-theme");
      if (saved === "dark" || saved === "light") {
        setDark(saved === "dark");
      } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        setDark(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ad-theme", next ? "dark" : "light");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

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
    setSigningOut(true);
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  const Sidebar = ({ variant }: { variant: "desktop" | "mobile" }) => (
    <aside
      className={
        variant === "desktop"
          ? "hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:gap-7 lg:border-r lg:border-line lg:bg-panel lg:p-6"
          : "flex h-full w-[84vw] max-w-[19rem] flex-col gap-7 border-r border-line bg-panel p-6"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <Wordmark />
        {variant === "mobile" ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-raised text-muted transition-colors hover:text-ink"
            aria-label="Close menu"
          >
            <IconX className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="grid gap-1">
        <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">Manage</p>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 " +
                (active ? "bg-gold/12 font-medium text-ink" : "text-muted hover:bg-raised hover:text-ink")
              }
            >
              <Icon className={"h-[18px] w-[18px] " + (active ? "text-gold" : "text-faint group-hover:text-muted")} />
              <span>{item.label}</span>
              {active ? <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-gold" aria-hidden /> : null}
            </Link>
          );
        })}

        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors duration-150 hover:bg-raised hover:text-ink"
        >
          <IconStore className="h-[18px] w-[18px] text-faint" />
          <span>View storefront</span>
        </Link>
      </nav>

      <div className="mt-auto grid gap-3">
        <div className="ad-card-raised flex items-center gap-3 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 font-serif text-sm text-gold">
            {(userEmail ?? "A").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] text-faint">Signed in</p>
            <p className="truncate text-sm font-medium text-ink">{userEmail ?? "admin"}</p>
          </div>
        </div>

        <button type="button" onClick={() => void onSignOut()} disabled={signingOut} className="ad-btn">
          <IconLogOut className="h-4 w-4 text-faint" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className={"ad-theme min-h-screen bg-canvas text-ink" + (dark ? " ad-dark" : "")}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
        <Sidebar variant="desktop" />

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
            <div className="absolute left-0 top-0 h-full">
              <Sidebar variant="mobile" />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-7">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-raised text-ink transition-colors hover:bg-raised2 lg:hidden"
                  aria-label="Open menu"
                >
                  <IconMenu className="h-4 w-4" />
                </button>
                <h1 className="font-serif text-xl leading-none text-ink">{title}</h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-raised text-muted transition-colors hover:bg-raised2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
                  aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
                  title={dark ? "Light theme" : "Dark theme"}
                >
                  {dark ? <IconSun className="h-[18px] w-[18px]" /> : <IconMoon className="h-[18px] w-[18px]" />}
                </button>
                <Link href="/" className="ad-btn hidden h-10 px-3.5 py-0 text-xs sm:inline-flex">
                  <IconStore className="h-4 w-4 text-faint" />
                  View storefront
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-7 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
