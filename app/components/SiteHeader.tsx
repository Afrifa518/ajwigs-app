"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "@/app/providers";

export default function SiteHeader() {
  const router = useRouter();
  const { userEmail, getCartCount, signOut } = useShop();
  const cartCount = getCartCount();

  const onSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between gap-4">
      <Link href="/" className="text-lg font-semibold">
        AJ Wigs
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <Link className="underline" href="/cart">
          Cart{cartCount ? ` (${cartCount})` : ""}
        </Link>

        <Link className="underline" href="/orders">
          Orders
        </Link>

        <Link className="underline" href="/admin">
          Admin
        </Link>

        {userEmail ? (
          <>
            <span className="text-gray-600">{userEmail}</span>
            <button type="button" className="underline" onClick={() => void onSignOut()}>
              Sign out
            </button>
          </>
        ) : (
          <Link className="underline" href="/login">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
