import Image from "next/image";
import { assets } from "@/app/storefront/assets";

export default function HomeHighlights() {
  return (
    <section className="my-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-gray-300 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm">
          <Image
            src={assets.quality_icon}
            className="h-10 w-10"
            alt="Premium quality"
          />
          <p className="mt-4 text-sm font-semibold text-gray-800">Premium quality</p>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            Soft textures and clean finishes you can trust.
          </p>
        </div>

        <div className="border border-gray-300 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm">
          <Image
            src={assets.exchange_icon}
            className="h-10 w-10"
            alt="Easy exchange"
          />
          <p className="mt-4 text-sm font-semibold text-gray-800">Easy exchange</p>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            Simple support if you need help with your order.
          </p>
        </div>

        <div className="border border-gray-300 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm">
          <Image src={assets.support_img} className="h-10 w-10" alt="Customer support" />
          <p className="mt-4 text-sm font-semibold text-gray-800">Fast support</p>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            Quick answers, smooth checkout, and easy tracking.
          </p>
        </div>
      </div>
    </section>
  );
}
