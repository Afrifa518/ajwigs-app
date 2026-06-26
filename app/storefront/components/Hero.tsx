"use client";

import Image from "next/image";
import Link from "next/link";
import { assets } from "@/app/storefront/assets";

export default function Hero() {
  return (
    <section className="relative w-screen ml-[calc(50%-50vw)] overflow-hidden bg-[#F6F2EA]">
      {/* atmosphere: warm light + fine grain, no heavy 3D */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_-10%,rgba(200,169,81,0.16),transparent_55%)]" />

      <div className="mx-auto grid max-w-[1500px] items-stretch gap-0 px-0 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_1fr]">
        {/* ── Text ── */}
        <div className="order-2 flex flex-col justify-center px-6 py-12 sm:px-[5vw] lg:order-1 lg:py-20 lg:pl-[7vw] lg:pr-10">
          <div className="hero-enter inline-flex items-center gap-3">
            <span className="h-px w-10 bg-[#C8A951]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#6b5a32]">
              Premium Ghanaian Hair House
            </p>
          </div>

          <h1 className="prata-regular hero-enter hero-enter-delay-1 mt-6 text-[clamp(2.9rem,7vw,5.6rem)] leading-[0.98] tracking-[-0.025em] text-[#1c1714]">
            Your crown,
            <br />
            <span className="relative inline-block">
              perfected.
              <span className="gold-draw absolute -bottom-1 left-0 h-[3px] w-full bg-[#C8A951]" />
            </span>
          </h1>

          <p className="hero-enter hero-enter-delay-2 mt-6 max-w-md text-[15px] leading-relaxed text-[#4b4339] sm:text-base">
            Hand-finished luxury wigs — flawless lace, rich texture, a secure all-day fit.
            Look expensive, feel effortless, and order in minutes.
          </p>

          <div className="hero-enter hero-enter-delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/collection"
              className="press group inline-flex items-center justify-center gap-2 bg-[#1c1714] px-8 py-4 text-sm font-medium tracking-wide text-[#F6F2EA] transition-colors hover:bg-black"
            >
              Shop the collection
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/collection"
              className="press inline-flex items-center justify-center border border-[#1c1714]/25 px-8 py-4 text-sm font-medium text-[#1c1714] transition-colors hover:border-[#C8A951] hover:text-[#8a6a1f]"
            >
              View best sellers
            </Link>
          </div>

          <dl className="hero-enter hero-enter-delay-3 mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-[#1c1714]/10 pt-7 text-[#4b4339]">
            {[
              ["100%", "Human hair"],
              ["24h", "Accra dispatch"],
              ["5.0★", "Client rated"],
            ].map(([k, v]) => (
              <div key={v} className="flex flex-col">
                <dt className="prata-regular text-xl text-[#1c1714]">{k}</dt>
                <dd className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[#6b5a32]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Image ── */}
        <div className="relative order-1 min-h-[62vh] overflow-hidden lg:order-2 lg:min-h-0">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={assets.hero_img}
              alt="Model wearing a honey-toned bob wig with a gold pendant necklace"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="img-reveal kenburns object-cover object-[50%_22%]"
            />
          </div>
          {/* edge blends so the photo melts into the ivory page */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c1714]/35 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-28 bg-gradient-to-r from-[#F6F2EA] to-transparent lg:block" />

          {/* floating lace-detail inset for depth */}
          <div className="absolute bottom-5 left-5 hidden w-40 overflow-hidden rounded-xl border border-white/30 shadow-2xl sm:block lg:bottom-8 lg:left-8 lg:w-48">
            <div className="relative aspect-[4/5]">
              <Image src={assets.about_img} alt="Close-up of the hand-finished HD lace" fill sizes="200px" className="object-cover" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/90">HD lace · by hand</p>
            </div>
          </div>

          {/* rating badge */}
          <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-[#F6F2EA]/90 px-3.5 py-2 shadow-lg backdrop-blur lg:right-8 lg:top-8">
            <span className="text-sm text-[#C8A951]">★★★★★</span>
            <span className="text-xs font-medium text-[#1c1714]">Loved by clients</span>
          </div>
        </div>
      </div>
    </section>
  );
}
