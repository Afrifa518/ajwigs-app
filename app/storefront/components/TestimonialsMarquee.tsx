import { assets } from "@/app/storefront/assets";
import Image from "next/image";

const testimonials = [
  {
    quote: "The hair quality is amazing and the install looks so natural.",
    name: "Adwoa",
  },
  {
    quote: "Fast delivery and the texture stayed soft after washing.",
    name: "Kemi",
  },
  {
    quote: "Perfect fit and the color options are exactly what I needed.",
    name: "Jane",
  },
  {
    quote: "I get compliments every time I wear it. 10/10.",
    name: "Nana Oye",
  },
];

export default function TestimonialsMarquee() {
  const items = [...testimonials, ...testimonials];

  return (
    <section className="my-14 border-y border-gray-200 bg-white py-10">
      <div className="text-center">
        <p className="text-3xl">
          <span className="text-gray-500">CUSTOMER</span>{" "}
          <span className="text-gray-700 font-medium">LOVE</span>
        </p>
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Real feedback from shoppers who found their perfect crown.
        </p>
      </div>

      <div className="mt-8 marquee">
        <div className="marquee__inner">
          {items.map((t, idx) => (
            <div
              key={idx}
              className="mx-3 w-[280px] shrink-0 rounded-none border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Image
                    key={i}
                    src={assets.star_icon}
                    alt="star"
                    className="h-4 w-4"
                  />
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-700">“{t.quote}”</p>
              <p className="mt-3 text-xs font-semibold text-gray-900">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <p className="text-xs text-gray-500">Swipe/scroll to read more</p>
      </div>
    </section>
  );
}
