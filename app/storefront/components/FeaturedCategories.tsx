import Image from "next/image";
import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/app/storefront/catalog";

import frontal1 from "../../../assets/frontal1.jpg";
import closure1 from "../../../assets/closure1.jpg";
import wavy from "../../../assets/wavy.png";

const images = [frontal1, closure1, wavy];

export default function FeaturedCategories() {
  const featured = PRODUCT_CATEGORIES.slice(0, 3);

  return (
    <section className="my-14">
      <div className="text-center py-6">
        <p className="text-3xl">
          <span className="text-gray-500">SHOP BY</span>{" "}
          <span className="font-medium text-gray-800">CATEGORY</span>
        </p>
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Find your perfect look in seconds—pick a style and explore the collection.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {featured.map((c, idx) => (
          <Link
            key={c.value}
            href="/collection"
            className="group relative overflow-hidden rounded-sm border border-gray-200 bg-white shadow-[0_10px_30px_-25px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-30px_rgba(0,0,0,0.45)]"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={images[idx] ?? images[0]}
                alt={c.label}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 33vw"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(200,169,81,0.18),transparent_55%)]" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-lg font-semibold text-white">{c.label}</p>
              <p className="text-sm text-white/80">Tap to explore</p>
            </div>

            <div className="absolute inset-0 ring-1 ring-black/0 transition group-hover:ring-[#C8A951]/35" />
          </Link>
        ))}
      </div>
    </section>
  );
}
