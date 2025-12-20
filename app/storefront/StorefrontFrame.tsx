"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import StorefrontNavbar from "@/app/storefront/components/StorefrontNavbar";
import StorefrontSearchBar from "@/app/storefront/components/StorefrontSearchBar";
import StorefrontFooter from "@/app/storefront/components/StorefrontFooter";

export default function StorefrontFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <StorefrontNavbar />
      <StorefrontSearchBar />
      {children}
      <StorefrontFooter />
    </div>
  );
}
