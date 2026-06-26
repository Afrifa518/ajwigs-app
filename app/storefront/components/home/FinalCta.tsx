import Link from "next/link";
import MotionReveal from "@/app/storefront/components/home/MotionReveal";
import { buildWhatsappLink, STORE_NAME } from "@/lib/whatsapp";

export default function FinalCta() {
  const waLink = buildWhatsappLink(`Hello ${STORE_NAME}! I'd like help choosing my wig.`);

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#1c1714] text-[#F1E9D9]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_50%_-10%,rgba(200,169,81,0.25),transparent_60%)]" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,169,81,0.22),transparent_65%)] blur-3xl" />

      <div className="relative mx-auto max-w-[1400px] px-4 py-24 text-center sm:px-[5vw] sm:py-32 md:px-[7vw] lg:px-[9vw]">
        <MotionReveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#C8A951]">El-ROI Lux Hairs</p>
          <h2 className="prata-regular mx-auto mt-5 max-w-3xl text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.04] tracking-[-0.02em] text-[#F6F2EA]" style={{ textWrap: "balance" }}>
            Find your crown today.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[#cfc3ac] sm:text-base">
            Beautiful, confident, naturally you — without the stress. Browse the collection
            or message us and we&apos;ll help you choose the perfect fit.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/collection"
              className="press group inline-flex w-full items-center justify-center gap-2 bg-[#F6F2EA] px-7 py-3.5 text-sm font-semibold text-[#1c1714] transition-colors hover:bg-white sm:w-auto"
            >
              Shop the collection
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-none bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] sm:w-auto"
            >
              <svg viewBox="0 0 32 32" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M16.04 4C9.95 4 5 8.95 5 15.04c0 1.95.51 3.84 1.47 5.51L5 28l7.62-1.43c1.6.87 3.4 1.33 5.23 1.33h.01c6.09 0 11.04-4.95 11.04-11.04C28.9 8.99 22.13 4 16.04 4zm0 20.2h-.01c-1.6 0-3.17-.43-4.55-1.25l-.33-.19-3.38.89.9-3.3-.21-.34a9.06 9.06 0 0 1-1.39-4.82c0-5.02 4.09-9.1 9.12-9.1 2.44 0 4.73.95 6.45 2.68a9.06 9.06 0 0 1 2.67 6.44c0 5.03-4.08 9.04-9.08 9.04z" />
              </svg>
              Order on WhatsApp
            </a>
            <Link
              href="/collection"
              className="inline-flex w-full items-center justify-center border border-[#F6F2EA]/30 px-7 py-3.5 text-sm font-medium text-[#F6F2EA] transition-colors hover:border-[#C8A951] hover:text-[#C8A951] sm:w-auto"
            >
              View best sellers
            </Link>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
