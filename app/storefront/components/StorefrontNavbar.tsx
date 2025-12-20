"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useShop } from "@/app/providers";
import { assets } from "@/app/storefront/assets";

export default function StorefrontNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const { setShowSearch, getCartCount, token, signOut } = useShop();

  const logout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const navLinkClass = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `flex flex-col items-center gap-1 ${isActive ? "active" : ""}`;
  };

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link href="/">
        <Image src={assets.logo} className="w-36" alt="HouseofAJ" />
      </Link>

      <ul className="hidden gap-5 text-sm text-gray-700 sm:flex">
        <Link href="/" className={navLinkClass("/")}
          >
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </Link>
        <Link href="/collection" className={navLinkClass("/collection")}
          >
          <p>WIGS</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </Link>
        <Link href="/about" className={navLinkClass("/about")}
          >
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </Link>
        <Link href="/contact" className={navLinkClass("/contact")}
          >
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </Link>
      </ul>

      <div className="flex items-center gap-6">
        <Image
          onClick={() => setShowSearch((prev) => !prev)}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt=""
        />
        <div className="relative group">
          <Image
            onClick={() => (token ? null : router.push("/login"))}
            className="w-5 cursor-pointer"
            src={assets.profile_icon}
            alt=""
          />
          {token ? (
            <div className="absolute right-0 hidden pt-4 group-hover:block dropdown-menu">
              <div className="flex flex-col gap-2 px-5 py-3 text-gray-500 rounded w-36 bg-slate-100">
                <p
                  onClick={() => router.push("/orders")}
                  className="cursor-pointer hover:text-black"
                >
                  Orders
                </p>
                <p onClick={() => void logout()} className="cursor-pointer hover:text-black">
                  Logout
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <Link href="/cart" className="relative">
          <Image src={assets.cart_icon} className="w-5 min-w-5" alt="" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>
        <Image
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt=""
        />
      </div>

      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer"
          >
            <Image src={assets.dropdown_icon} className="h-4 rotate-180" alt="" />
            <p>Back</p>
          </div>
          <Link
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            href="/"
          >
            HOME
          </Link>
          <Link
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            href="/collection"
          >
            WIGS
          </Link>
          <Link
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            href="/about"
          >
            ABOUT
          </Link>
          <Link
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            href="/contact"
          >
            CONTACT
          </Link>
        </div>
      </div>
    </div>
  );
}
