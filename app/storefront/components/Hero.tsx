import Image from "next/image";
import Link from "next/link";
import { assets } from "@/app/storefront/assets";

export default function Hero() {
  return (
    <div className="relative flex flex-col overflow-hidden border border-gray-400 sm:flex-row">
      <div className="relative flex w-full items-center justify-center py-12 sm:w-1/2 sm:py-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.06),transparent_55%)]" />

        <div className="relative px-6 text-[#2f2f2f] sm:px-10">
          <div className="hero-enter inline-flex items-center gap-3">
            <span className="h-px w-10 bg-[#C8A951]/80" />
            <p className="text-xs font-semibold tracking-[0.22em] text-gray-600">
              HOUSE OF AJ
            </p>
          </div>

          <h1 className="prata-regular hero-enter hero-enter-delay-1 mt-4 text-4xl leading-[1.15] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Luxury wigs.
            <br />
            Effortless confidence.
          </h1>

          <p className="hero-enter hero-enter-delay-2 mt-4 max-w-md text-sm leading-relaxed text-gray-600 sm:text-base">
            Premium textures, clean hairlines, and a secure fit—crafted for a flawless finish
            every time.
          </p>

          <div className="hero-enter hero-enter-delay-3 mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/collection"
              className="inline-flex items-center justify-center border border-black bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              Shop the collection
            </Link>
            <Link
              href="/collection"
              className="inline-flex items-center justify-center border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#C8A951]/70 hover:bg-gray-50"
            >
              Explore best sellers
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8A951]/80" />
              Fast delivery
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8A951]/80" />
              Secure checkout
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8A951]/80" />
              Premium quality
            </span>
          </div>
        </div>
      </div>

      <div className="relative w-full sm:w-1/2">
        <Image
          className="hero-float w-full"
          src={assets.hero_img}
          alt="House of AJ Wigs"
          priority
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,169,81,0.14),transparent_55%)]" />
      </div>
    </div>
  );
}
