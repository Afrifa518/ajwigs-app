"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useShop } from "@/app/providers";
import MotionReveal from "@/app/storefront/components/home/MotionReveal";

export default function BestSellers() {
  const { products, currency } = useShop();

  const featured = useMemo(() => {
    const best = products.filter((p) => p.bestseller);
    const pool = best.length >= 4 ? best : products;
    return pool.slice(0, 8);
  }, [products]);

  return (
    <section className="relative py-20 sm:py-28">
      <MotionReveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5a32]">Most wanted</p>
          <h2 className="prata-regular mt-3 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.01em] text-[#1c1714]">
            Best sellers
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-[#6b5a32]">
          The styles our clients keep coming back for. Popular lengths sell out fast —
          secure yours.
        </p>
      </MotionReveal>

      {featured.length === 0 ? (
        <MotionReveal delay={120}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-[1.6rem] border border-dashed border-[#1c1714]/15 bg-[#F6F2EA]/70 px-6 py-16 text-center">
            <p className="prata-regular text-xl text-[#1c1714]">The new collection is arriving.</p>
            <p className="max-w-sm text-sm text-[#6b5a32]">
              Our best sellers are being photographed now. Message us on WhatsApp to see
              what&apos;s in stock today and reserve yours first.
            </p>
            <Link
              href="/collection"
              className="mt-1 inline-flex items-center justify-center bg-[#1c1714] px-6 py-3 text-sm font-medium text-[#F6F2EA] transition-colors hover:bg-black"
            >
              Browse the collection
            </Link>
          </div>
        </MotionReveal>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p, i) => (
            <MotionReveal key={p._id} delay={Math.min(i, 4) * 70} as="article" className="[perspective:1200px]">
              <Link
                href={`/product/${p._id}`}
                className="group block transition-transform duration-500 ease-out will-change-transform hover:-translate-y-1.5"
              >
                <div className="relative overflow-hidden rounded-[1.1rem] border border-[#1c1714]/10 bg-white shadow-[0_18px_50px_-28px_rgba(28,23,20,0.45)] transition-shadow duration-500 group-hover:shadow-[0_30px_70px_-30px_rgba(28,23,20,0.55)]">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#efe9dd]">
                    {p.image?.[0] ? (
                      <Image
                        src={p.image[0]}
                        alt={p.name}
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    ) : null}
                    {p.bestseller ? (
                      <span className="absolute left-3 top-3 rounded-full bg-[#1c1714]/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#F1E6CE] backdrop-blur">
                        Bestseller
                      </span>
                    ) : null}
                    <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-[#F6F2EA]/95 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#1c1714] opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      View details
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-[#1c1714]">{p.name}</p>
                  <p className="shrink-0 text-sm tabular-nums text-[#6b5a32]">
                    {currency}
                    {p.price}
                  </p>
                </div>
              </Link>
            </MotionReveal>
          ))}
        </div>
      )}

      {featured.length > 0 ? (
        <MotionReveal className="mt-12 text-center">
          <Link
            href="/collection"
            className="inline-flex items-center justify-center border border-[#1c1714]/25 px-7 py-3.5 text-sm font-medium text-[#1c1714] transition-colors hover:border-[#C8A951] hover:text-[#8a6a1f]"
          >
            See the full collection
          </Link>
        </MotionReveal>
      ) : null}
    </section>
  );
}
