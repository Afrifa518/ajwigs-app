import Link from "next/link";

export default function HomeCtaBanner() {
  return (
    <section className="my-14 border border-gray-300 bg-white">
      <div className="grid gap-6 p-8 sm:p-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-sm font-medium text-gray-500">Ready for your next install?</p>
          <h3 className="mt-2 prata-regular text-3xl leading-snug text-gray-800 sm:text-4xl">
            Shop premium wigs made for confidence.
          </h3>
          <p className="mt-3 text-sm text-gray-600 sm:text-base">
            Browse best sellers, explore new arrivals, and find the style that fits your vibe.
          </p>
        </div>

        <div className="md:col-span-5 md:flex md:items-center md:justify-end">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/collection"
              className="inline-flex items-center justify-center border border-gray-400 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-black hover:text-white"
            >
              Shop wigs
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              Ask a question
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
