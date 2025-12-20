import Image from "next/image";
import Link from "next/link";

import img1 from "../../../assets/img1.jpg";
import img2 from "../../../assets/img2.jpg";
import img3 from "../../../assets/img3.jpg";
import img4 from "../../../assets/img4.jpg";
import img5 from "../../../assets/img5.jpg";
import img6 from "../../../assets/img6.jpg";

const images = [img1, img2, img3, img4, img5, img6];

export default function LookbookGrid() {
  return (
    <section className="my-14">
      <div className="text-center py-6">
        <p className="text-3xl">
          <span className="text-gray-500">THE</span>{" "}
          <span className="font-medium text-gray-800">LOOKBOOK</span>
        </p>
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          A quick preview of the vibe—fresh installs, soft waves, and clean finishes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {images.map((img, idx) => (
          <Link
            key={idx}
            href="/collection"
            className="group relative overflow-hidden rounded-sm border border-gray-200 bg-white shadow-[0_10px_30px_-25px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-30px_rgba(0,0,0,0.45)]"
          >
            <div className="relative aspect-square w-full">
              <Image
                src={img}
                alt="Wig look"
                fill
                className="object-cover transition duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 16vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(200,169,81,0.16),transparent_55%)]" />
            </div>

            <div className="absolute inset-0 ring-1 ring-black/0 transition group-hover:ring-[#C8A951]/30" />
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center">
        <Link
          href="/collection"
          className="inline-flex items-center justify-center border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#C8A951]/60 hover:bg-gray-50"
        >
          Explore the full collection
        </Link>
      </div>
    </section>
  );
}
