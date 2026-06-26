import MotionReveal from "@/app/storefront/components/home/MotionReveal";
import { buildWhatsappLink, STORE_NAME } from "@/lib/whatsapp";

// Placeholder client voices — replace with real reviews as they come in.
const VOICES = [
  {
    quote:
      "Nobody believes it's a wig. The lace just disappears — I've stopped explaining and started enjoying the compliments.",
    name: "Ama",
    place: "London",
  },
  {
    quote:
      "Ordered on WhatsApp in the evening, wore it to a wedding two days later. Secure all night, zero adjusting.",
    name: "Akosua",
    place: "Manchester",
  },
  {
    quote:
      "Soft, full, and still beautiful months later. It actually feels like a luxury you keep, not a one-time look.",
    name: "Adwoa",
    place: "Birmingham",
  },
];

const SIGNALS = [
  { k: "Order on WhatsApp", v: "Real people, quick replies" },
  { k: "24-hour dispatch", v: "From the UK, nationwide" },
  { k: "Pay on delivery", v: "Or secure card checkout" },
  { k: "Easy 7-day returns", v: "Shop with confidence" },
];

const IconStar = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#C8A951]" fill="currentColor" aria-hidden="true">
    <path d="m12 2 2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 7.1-1.01L12 2z" />
  </svg>
);

export default function TrustProof() {
  const waLink = buildWhatsappLink(`Hello ${STORE_NAME}! Please share your latest styles and client reviews.`);

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#EFE7D6]/70 py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <MotionReveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5a32]">Loved & trusted</p>
          <h2 className="prata-regular mt-3 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-[#1c1714]" style={{ textWrap: "balance" }}>
            Women who don&apos;t settle, choose El-ROI.
          </h2>
        </MotionReveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {VOICES.map((v, i) => (
            <MotionReveal key={v.name} delay={i * 90} as="article">
              <figure className="flex h-full flex-col rounded-[1.2rem] border border-[#1c1714]/10 bg-[#F6F2EA] p-6 shadow-[0_18px_50px_-30px_rgba(28,23,20,0.4)]">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <IconStar key={s} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-[#3a332b]">
                  &ldquo;{v.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold text-[#1c1714]">{v.name}</span>
                  <span className="text-[#6b5a32]"> · {v.place}</span>
                </figcaption>
              </figure>
            </MotionReveal>
          ))}
        </div>

        <MotionReveal delay={120} className="mt-12">
          <div className="grid gap-px overflow-hidden rounded-[1.2rem] border border-[#1c1714]/10 bg-[#1c1714]/10 sm:grid-cols-2 lg:grid-cols-4">
            {SIGNALS.map((s) => (
              <div key={s.k} className="bg-[#F6F2EA] px-5 py-6">
                <p className="text-sm font-semibold text-[#1c1714]">{s.k}</p>
                <p className="mt-1 text-[13px] text-[#6b5a32]">{s.v}</p>
              </div>
            ))}
          </div>
        </MotionReveal>

        <MotionReveal delay={160} className="mt-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <p className="text-sm text-[#4b4339]">Want to see what&apos;s in stock right now?</p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
          >
            <svg viewBox="0 0 32 32" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M16.04 4C9.95 4 5 8.95 5 15.04c0 1.95.51 3.84 1.47 5.51L5 28l7.62-1.43c1.6.87 3.4 1.33 5.23 1.33h.01c6.09 0 11.04-4.95 11.04-11.04C28.9 8.99 22.13 4 16.04 4zm0 20.2h-.01c-1.6 0-3.17-.43-4.55-1.25l-.33-.19-3.38.89.9-3.3-.21-.34a9.06 9.06 0 0 1-1.39-4.82c0-5.02 4.09-9.1 9.12-9.1 2.44 0 4.73.95 6.45 2.68a9.06 9.06 0 0 1 2.67 6.44c0 5.03-4.08 9.04-9.08 9.04z" />
            </svg>
            Chat on WhatsApp
          </a>
        </MotionReveal>
      </div>
    </section>
  );
}
